import {Component, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import {Observable, forkJoin, BehaviorSubject, of as observableOf, Subject} from 'rxjs';
import {map, switchMap, finalize, catchError, tap} from 'rxjs/operators';
import { EmployeeCategoryService } from '@app/components/salary/shared/services/category/employee-category.service';
import { EmployeeOnCategoryService } from '@app/components/salary/shared/services/category/employee-on-category.service';
import { UniView, ISaveObject } from '@uni-framework/core/uniView';
import { IToolbarSearchConfig, IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { EmployeeCategory, EmployeeCategoryLink } from '@uni-entities';
import { IUniSaveAction } from '@uni-framework/save/save';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { UniCacheService, ErrorService, EmployeeService } from '@app/services/services';
import { UniModalService, ConfirmActions } from '@uni-framework/uni-modal';
import { CategoryViewService } from '@app/components/salary/category/shared/services/category-view.service';

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
        private route: ActivatedRoute,
        private categoryService: EmployeeCategoryService,
        private router: Router,
        private tabService: TabService,
        public cacheService: UniCacheService,
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
            action: done => this.saveAll(done),
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
                    this.getCategory();
                }
                this.getEmployeeCategoryLinks(this.categoryID);
            }
        });

    }

    public ngOnDestroy() {
        this.destroy$.next();
    }

    public canDeactivate(): Observable<boolean> {
        if (this.saveComplete) {
            return Observable.of(this.saveComplete);
        }

        return Observable
            .of(super.isDirty())
            .switchMap(dirty => dirty
                ? this.modalService.openUnsavedChangesModal().onClose
                : Observable.of(ConfirmActions.REJECT))
            .map(result => {
                if (result === ConfirmActions.ACCEPT) {
                    this.saveAll(m => {}, false);
                }

                return result !== ConfirmActions.CANCEL;
            })
            .map(allowed => {
                if (allowed) {
                    this.cacheService.clearPageCache(this.cacheKey);
                }

                return allowed;
            });
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

    private saveAll(done: (message: string) => void, updateView = true) {
        if (this.currentCategory && !this.currentCategory.Name) {
            return done('Lagring feilet. Sett navn på kategori');
        }

        this.getSubSaveObjects()
            .pipe(
                switchMap(saveObj => this.saveAllObs(done, updateView, saveObj.filter(x => x.dirty))),
                finalize(() => done('lagring fullført')),
                catchError((err, obs) => {
                    done('Lagring feilet');
                    return this.errorService.handleRxCatch(err, obs);
                })
            )
            .subscribe();
    }

    private getSubSaveObjects(): Observable<ISaveObject[]> {
        return forkJoin(
            super.getSaveObject(EMP_CAT_LINKS_KEY)
        );
    }

    private saveAllObs(done: (message: string) => void, updateView: boolean, saveSubObjects: ISaveObject[]): Observable<any[]> {

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
                    done('lagring fullført');
                    this.saveActions[0].disabled = true;
                    this.router.navigateByUrl(this.url + cat.ID + '/' + childRoute);
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

    private checkDirty() {
        if (super.isDirty()) {
            this.saveActions[0].disabled = false;
        } else {
            this.saveActions[0].disabled = true;
        }
    }

    private getCategory() {
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

    public previousCategory() {
        this.canDeactivate().subscribe(canDeactivate => {
            if (canDeactivate) {
                this.categoryService.getPrevious(this.currentCategory.ID)
                    .subscribe((prev: EmployeeCategory) => {
                        if (prev) {
                            this.currentCategory = prev;
                            const childRoute = this.router.url.split('/').pop();
                            this.router.navigateByUrl(this.url + prev.ID + '/' + childRoute);
                        }
                    }, err => this.errorService.handle(err));
            }
        });
    }

    public nextCategory() {
        this.canDeactivate().subscribe(canDeactivate => {
            if (canDeactivate) {
                this.categoryService.getNext(this.currentCategory.ID)
                    .subscribe((next: EmployeeCategory) => {
                        if (next) {
                            this.currentCategory = next;
                            const childRoute = this.router.url.split('/').pop();
                            this.router.navigateByUrl(this.url + next.ID + '/' + childRoute);
                        }
                    }, err => this.errorService.handle(err));
            }
        });
    }

    public newCategory() {
        this.canDeactivate().subscribe(canDeactivate => {
            if (canDeactivate) {
                this.categoryService.GetNewEntity([''], 'employeecategory').subscribe((response) => {
                    if (response) {
                        this.currentCategory = response;
                        const childRoute = this.router.url.split('/').pop();
                        this.router.navigateByUrl(this.url + response.ID + '/' + childRoute);
                    }
                }, err => this.errorService.handle(err));
            }
        });
    }
}
