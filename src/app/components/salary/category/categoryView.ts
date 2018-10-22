import {Component} from '@angular/core';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import {EmployeeCategory} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {EmployeeCategoryService, UniCacheService, ErrorService} from '../../../services/services';
import {CategoryViewService} from './services/categoryViewService';
import {ToastService} from '../../../../framework/uniToast/toastService';
import {IUniSaveAction} from '../../../../framework/save/save';
import {IToolbarConfig, IToolbarSearchConfig} from '../../common/toolbar/toolbar';

import {UniView} from '../../../../framework/core/uniView';
import {UniModalService, ConfirmActions} from '../../../../framework/uni-modal';

import {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs';

@Component({
    selector: 'uni-employeecategory-view',
    templateUrl: './categoryView.html'
})
export class CategoryView extends UniView {

    public busy: boolean;
    public searchConfig$: BehaviorSubject<IToolbarSearchConfig> = new BehaviorSubject(null);
    private url: string = '/salary/employeecategories/';

    private categoryID: number;
    public currentCategory: EmployeeCategory;
    public saveActions: IUniSaveAction[];
    public toolbarConfig: IToolbarConfig;

    public childRoutes: any[];

    constructor(
        private route: ActivatedRoute,
        private categoryService: EmployeeCategoryService,
        private toastService: ToastService,
        private router: Router,
        private tabService: TabService,
        public cacheService: UniCacheService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private categoryViewService: CategoryViewService
    ) {

        super(router.url, cacheService);

        this.childRoutes = [
            {name: 'Detaljer', path: 'details'}
        ];

        this.saveActions = [{
            label: 'Lagre',
            action: this.saveCategory.bind(this),
            main: true,
            disabled: true
        }];

        this.route.params.subscribe((params) => {
            this.categoryID = +params['id'];

            super.updateCacheKey(this.router.url);

            super.getStateSubject('employeecategory')
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
            if (this.currentCategory && this.currentCategory.ID === +params['id']) {
                super.updateState('employeecategory', this.currentCategory, false);
            } else {
                this.currentCategory = undefined;
            }


        });

        this.router.events.subscribe((event: any) => {
            if (event instanceof NavigationEnd) {
                if (!this.currentCategory) {
                    this.getCategory();
                }
            }
        });

    }

    public canDeactivate(): Observable<boolean> {

        return Observable
            .of(super.isDirty())
            .switchMap(dirty => dirty
                ? this.modalService.openUnsavedChangesModal().onClose
                : Observable.of(ConfirmActions.REJECT))
            .map(result => {
                if (result === ConfirmActions.ACCEPT) {
                    this.saveCategory(m => {}, false);
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

    private saveCategory(done: (message: string) => void, updateView = true) {

        let saver = this.currentCategory.ID
            ? this.categoryService.Put(this.currentCategory.ID, this.currentCategory)
            : this.categoryService.Post(this.currentCategory);

        saver.subscribe((category: EmployeeCategory) => {
            if (updateView) {
                super.updateState('employeecategory', this.currentCategory, false);
                let childRoute = this.router.url.split('/').pop();
                this.router.navigateByUrl(this.url + category.ID + '/' + childRoute);
                done('lagring fullført');
                this.saveActions[0].disabled = true;
            }
        },
            (error) => {
                done('Lagring feilet');
                this.errorService.handle(error);
            });
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

    public previousCategory() {
        this.canDeactivate().subscribe(canDeactivate => {
            if (canDeactivate) {
                this.categoryService.getPrevious(this.currentCategory.ID)
                    .subscribe((prev: EmployeeCategory) => {
                        if (prev) {
                            this.currentCategory = prev;
                            let childRoute = this.router.url.split('/').pop();
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
                            let childRoute = this.router.url.split('/').pop();
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
                        let childRoute = this.router.url.split('/').pop();
                        this.router.navigateByUrl(this.url + response.ID + '/' + childRoute);
                    }
                }, err => this.errorService.handle(err));
            }
        });
    }
}
