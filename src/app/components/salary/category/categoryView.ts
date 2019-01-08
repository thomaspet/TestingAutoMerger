import {Component, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import {EmployeeCategory, EmployeeCategoryLink} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {EmployeeCategoryService, UniCacheService, ErrorService, EmployeeService} from '../../../services/services';
import {CategoryViewService} from './services/categoryViewService';
import {ToastService} from '../../../../framework/uniToast/toastService';
import {IUniSaveAction} from '../../../../framework/save/save';
import {IToolbarConfig, IToolbarSearchConfig} from '../../common/toolbar/toolbar';

import {UniView, ISaveObject} from '../../../../framework/core/uniView';
import {UniModalService, ConfirmActions} from '../../../../framework/uni-modal';

import {Observable, forkJoin, BehaviorSubject, of as observableOf, Subject} from 'rxjs';
import {map, switchMap, finalize, catchError, tap} from 'rxjs/operators';

const EMP_CAT_LINKS_KEY = 'employeeCategoryLinks';
const EMP_CAT_KEY = 'employeecategory';

@Component({
    selector: 'uni-employeecategory-view',
    templateUrl: './categoryView.html'
})
export class CategoryView extends UniView implements OnDestroy {

    public busy: boolean;
    public searchConfig$: BehaviorSubject<IToolbarSearchConfig> = new BehaviorSubject(null);
    private destroy$: Subject<void> = new Subject();
    private url: string = '/salary/employeecategories/';

    private categoryID: number;
    public currentCategory: EmployeeCategory;
    public saveActions: IUniSaveAction[];
    public toolbarConfig: IToolbarConfig;

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
        private employeeService: EmployeeService
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
                    this.router.navigateByUrl(this.url + cat.ID + '/' + childRoute);
                    done('lagring fullført');
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
            ...empLinksToDelete.map(link => this.employeeService
                    .deleteEmployeeCategory(link.Employee.ID, category.ID)
                    .pipe(map(() => link)))
        ).pipe(tap(() => this.getEmployeeCategoryLinks(category.ID)));
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
            .map(emps => <EmployeeCategoryLink[]>emps
                .map(emp => ({Employee: emp, EmployeeNumber: emp.EmployeeNumber, ID: emp.ID, EmployeeID: emp.ID})))
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
