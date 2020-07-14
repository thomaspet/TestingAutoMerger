import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Observable, forkJoin, BehaviorSubject, of as observableOf, Subject, of } from 'rxjs';
import { map, switchMap, finalize, catchError, tap, filter } from 'rxjs/operators';
import { EmployeeCategoryService } from '@app/components/salary/shared/services/category/employee-category.service';
import { EmployeeOnCategoryService } from '@app/components/salary/shared/services/category/employee-on-category.service';
import { UniView, ISaveObject } from '@uni-framework/core/uniView';
import { IToolbarSearchConfig, IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { EmployeeCategory, EmployeeCategoryLink } from '@uni-entities';
import { IUniSaveAction } from '@uni-framework/save/save';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { UniCacheService, ErrorService, EmployeeService } from '@app/services/services';
import { UniModalService, ConfirmActions } from '@uni-framework/uni-modal';
import { CategoryViewService } from '@app/components/salary/category/services/category-view.service';

const EMP_CAT_LINKS_KEY = 'employeeCategoryLinks';
const EMP_CAT_KEY = 'employeecategory';

@Component({
    selector: 'uni-employeecategory-view',
    templateUrl: './category-view.component.html'
})
export class CategoryViewComponent extends UniView implements OnDestroy {

    public busy: boolean;
    public searchConfig$: BehaviorSubject<IToolbarSearchConfig> = new BehaviorSubject(null);
    private destroy$: Subject<void> = new Subject();
    private url: string = '/salary/employeecategories/';

    private categoryID: number;
    public currentCategory: EmployeeCategory;
    public saveActions: IUniSaveAction[];
    public toolbarConfig: IToolbarConfig;
    private saveComplete: boolean = false;

    public childRoutes: any[];

    constructor(
        public cacheService: UniCacheService,
        private route: ActivatedRoute,
        private categoryService: EmployeeCategoryService,
        private router: Router,
        private tabService: TabService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private categoryViewService: CategoryViewService,
        private employeeService: EmployeeService,
        private employeeOnCategoryService: EmployeeOnCategoryService,
    ) {

        super(router.url, cacheService);

        this.childRoutes = [
            {name: 'Detaljer', path: 'details'}
        ];

        this.saveActions = [{
            label: 'Lagre',
            action: this.save.bind(this),
            main: true,
            disabled: true
        }];

        this.route.params.subscribe((params) => {
            this.categoryID = +params['id'];

            super.updateCacheKey(this.router.url);

            super.getStateSubject(EMP_CAT_KEY)
                .takeUntil(this.destroy$)
                .do(empCat => this.searchConfig$.next(this.categoryViewService.setupSearchConfig(empCat)))
                .subscribe((employeeCategory: EmployeeCategory) => {
                    this.currentCategory = employeeCategory;
                    this.toolbarConfig = {
                        navigation: {
                            prev: this.previousCategory.bind(this),
                            next: this.nextCategory.bind(this),
                            add: this.newCategory.bind(this)
                        }
                    };

                    this.updateTabStrip(this.categoryID, this.currentCategory);

                    this.checkDirty();
                }, err => this.errorService.handle(err));

            super.getStateSubject(EMP_CAT_LINKS_KEY)
                .takeUntil(this.destroy$)
                .subscribe(() => this.checkDirty());

            if (this.currentCategory && this.currentCategory.ID === +params['id']) {
                super.updateState('employeecategory', this.currentCategory, false);
            } else {
                this.currentCategory = undefined;
            }


        });

        this.router.events.takeUntil(this.destroy$).subscribe((event: any) => {
            if (event instanceof NavigationEnd) {
                if (!this.currentCategory) {
                    this.setCategory();
                }
                this.getEmployeeCategoryLinks(this.categoryID);
            }
        });

    }

    public ngOnDestroy(): void {
        this.destroy$.next();
    }

    public canDeactivate(): Observable<boolean> {
        return this.saveComplete ? Observable.of(this.saveComplete)
        : Observable.of(!!super.isDirty()).pipe(
            switchMap(dirty => dirty ? this.modalService.openUnsavedChangesModal().onClose : Observable.of(ConfirmActions.REJECT)),
            switchMap((canSave: ConfirmActions) => {
                if (canSave === ConfirmActions.ACCEPT) {
                    return this.saveAll(false);
                }
                return of(canSave === ConfirmActions.REJECT);
            }),
            tap(x => {
                if (x) {
                    this.cacheService.clearPageCache(this.cacheKey);
                }
            })
        );
    }

    private updateTabStrip(categoryID, category: EmployeeCategory) {
        if (category.ID) {
            this.tabService.addTab({
                name: 'Kategorinr. ' + category.ID,
                url: this.url + category.ID,
                moduleID: UniModules.Categories,
                active: true
            });
        } else {
            this.tabService.addTab({
                name: 'Ny kategori',
                url: this.url + categoryID,
                moduleID: UniModules.Categories,
                active: true
            });
        }
    }

    private save(done: (message: string) => void): void {
        this.saveAll().subscribe(
            (x) => x ? done('lagring fullført') : done('Lagring feilet.'),
            (error) => {
                this.errorService.handle(error);
                done('Lagring feilet.');
            }
        );
    }

    private saveAll(updateView = true): Observable<boolean> {
        if (this.currentCategory && !this.currentCategory.Name) {
            return of(false);
        }

        return this.getSubSaveObjects()
            .pipe(
                switchMap(saveObj => this.saveAllObs(updateView, saveObj.filter(x => x.dirty))),
                switchMap(() => of(true))
            );
    }

    private getSubSaveObjects(): Observable<ISaveObject[]> {
        return forkJoin(
            super.getSaveObject(EMP_CAT_LINKS_KEY)
        );
    }

    private saveAllObs(updateView: boolean, saveSubObjects: ISaveObject[]): Observable<any[]> {

        return this.getSaveObject(EMP_CAT_KEY)
            .pipe(
                switchMap(catSaveObj => {
                    if (catSaveObj.dirty) {
                        return this.saveCategoryObs(catSaveObj.state);
                    } else {
                        return observableOf(catSaveObj.state);
                    }
                }),
                switchMap((cat: EmployeeCategory) => {
                    return forkJoin(
                        observableOf(cat),
                        ...saveSubObjects.map(obj => {
                            switch (obj.key) {
                                case EMP_CAT_LINKS_KEY:
                                    return this.saveEmpsObs(obj.state, cat);
                            }
                            return observableOf([]);
                        })
                    );
                }),
                tap(result => {
                    if (!updateView) {
                        return;
                    }
                    const cat = result[0];
                    super.updateState(EMP_CAT_KEY, cat, false);
                    const childRoute = this.router.url.split('/').pop();
                    this.saveComplete = true;
                    this.router.navigateByUrl(this.url + cat.ID + '/' + childRoute);
                    this.saveActions[0].disabled = true;
                })
            );
    }



    private saveEmpsObs(emps: EmployeeCategoryLink[], category: EmployeeCategory): Observable<EmployeeCategoryLink[]> {
        emps = emps.filter(x => !x['_isEmpty']);
        const empLinksToCreate = emps.filter(emp => !emp.ID);
        const empLinksToDelete = emps.filter(emp => emp.Deleted);
        return forkJoin(
            ...empLinksToCreate.map(link =>
                this.employeeService.saveEmployeeCategory(link.Employee.ID, category).pipe(map(() => link))),
            this.employeeOnCategoryService.deleteAllAndAskForForceDelete(category.ID, empLinksToDelete.map(link => link.Employee.ID))
        ).pipe(
            map((result: any[]) => result.reduce((acc, curr) => Array.isArray(curr) ? [...acc, ...curr] : [...acc, curr], [])),
            finalize(() => this.getEmployeeCategoryLinks(category.ID)),
        );
    }

    private saveCategoryObs(category: EmployeeCategory): Observable<EmployeeCategory> {
        return category.ID
            ? this.categoryService.Put(category.ID, category)
            : this.categoryService.Post(category);
    }

    private checkDirty(): void {
        if (super.isDirty()) {
            this.saveActions[0].disabled = false;
        } else {
            this.saveActions[0].disabled = true;
        }
    }

    private setCategory(): void {
        this.categoryService.getCategory(this.categoryID).subscribe((category: EmployeeCategory) => {
            this.currentCategory = category;
            super.updateState('employeecategory', category, false);
        }, err => this.errorService.handle(err));
    }

    private getEmployeeCategoryLinks(categoryID: number): void {
        this.categoryService
            .getEmployeesInCategory(categoryID)
            .pipe(
                map(emps => <EmployeeCategoryLink[]>emps
                    .map(emp => ({Employee: emp, EmployeeNumber: emp.EmployeeNumber, ID: emp.ID, EmployeeID: emp.ID}))),
                map(empLinks => empLinks.sort((a, b) => a.EmployeeNumber - b.EmployeeNumber))
            )
            .subscribe(empLinks => super.updateState(EMP_CAT_LINKS_KEY, empLinks));
    }

    public previousCategory(): void {
        this.categoryService.getPrevious(this.currentCategory.ID).pipe(
            filter((category: EmployeeCategory) => !!category)
        ).subscribe(
            (prev: EmployeeCategory) => {
                const childRoute = this.router.url.split('/').pop();
                this.router.navigateByUrl(this.url + prev.ID + '/' + childRoute).then(x => {
                    if (x) {
                        this.currentCategory = prev;
                    }
                });
            },
            (error) => {
                this.errorService.handle(error);
            });
    }

    public nextCategory(): void {
        this.categoryService.getNext(this.currentCategory.ID).pipe(
            filter((category: EmployeeCategory) => !!category)
        ).subscribe(
            (next: EmployeeCategory) => {
                const childRoute = this.router.url.split('/').pop();
                this.router.navigateByUrl(this.url + next.ID + '/' + childRoute).then(x => {
                    if (x) {
                        this.currentCategory = next;
                    }
                });
            },
            (error) => {
                this.errorService.handle(error);
            });
    }

    public newCategory(): void {
        this.categoryService.GetNewEntity([''], 'employeecategory').subscribe(
            (category: EmployeeCategory) => {
                const childRoute = this.router.url.split('/').pop();
                this.router.navigateByUrl(this.url + category.ID + '/' + childRoute).then(x => {
                    if (x) {
                        this.currentCategory = category;
                    }
                });
            },
            (error) => {
                this.errorService.handle(error);
            });
    }
}
