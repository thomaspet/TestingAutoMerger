import {Component} from '@angular/core';
import { UniView } from '@uni-framework/core/uniView';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { IToolbarSearchConfig, IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { UniCacheService, SalarybalanceTemplateService, ErrorService, SalarybalanceService } from '@app/services/services';
import { IUniSaveAction } from '@uni-framework/save/save';
import { SalaryBalanceTemplate, SalaryBalance, SalBalDrawType } from '@uni-entities';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { UniModalService, ConfirmActions } from '@uni-framework/uni-modal';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import {switchMap, take, catchError, map} from 'rxjs/operators';

const URL = '/salary/salarybalancetemplates/';
const SALBAL_TEMPLATE_KEY = 'salarybalancetemplate';
const SALARYBALANCES_ON_TEMPLATE_KEY = 'salarybalancesontemplate';

@Component({
    selector: 'salarybalance-template-view',
    templateUrl: './salarybalanceTemplateView.html'
})
export class SalarybalanceTemplateView extends UniView {
    public busy: boolean;
    private currentTemplate: SalaryBalanceTemplate;
    public searchConfig$: BehaviorSubject<IToolbarSearchConfig> = new BehaviorSubject(null);
    public toolbarConfig: IToolbarConfig;
    public childRoutes: any[];
    public saveActions: IUniSaveAction[];
    private salarybalanceTemplateID: number;
    private salarybalancesOnTemplate: SalaryBalance[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        public cacheService: UniCacheService,
        private salarybalanceTemplateService: SalarybalanceTemplateService,
        private errorService: ErrorService,
        private tabService: TabService,
        private modalService: UniModalService,
        private salarybalanceService: SalarybalanceService,
        private toastService: ToastService,
    ) {
        super(router.url, cacheService);

        this.childRoutes = [
            {
                name: 'Detaljer',
                path: 'details'
            }
        ];

        this.saveActions = [
            {
                label: 'Lagre',
                action: (done) => this.saveAll(done).subscribe(),
                main: true,
                disabled: true
            }
        ];

        this.route.params
            .subscribe((params) => {
                this.salarybalanceTemplateID = +params['id'];
                super.updateCacheKey(this.router.url);
                super.getStateSubject(SALBAL_TEMPLATE_KEY)
                    .do(salbalTemplate => this.searchConfig$.next(this.setupSearchConfig(salbalTemplate)))
                    .subscribe((salbalTemplate: SalaryBalanceTemplate) => {
                        this.currentTemplate = salbalTemplate;
                        this.toolbarConfig = {
                            navigation: {
                                prev: this.previousTemplate.bind(this),
                                next: this.nextTemplate.bind(this),
                                add: this.newTemplate.bind(this)
                            }
                        };
                        this.updateTab();
                        this.checkDirty();
                    },
                    err => this.errorService.handle(err));

                super.getStateSubject(SALARYBALANCES_ON_TEMPLATE_KEY)
                    .subscribe(salarybalances => {
                      this.salarybalancesOnTemplate = salarybalances;
                      this.checkDirty();
                    },
                    err => this.errorService.handle(err));

                if (this.currentTemplate && this.currentTemplate.ID === +params['id']) {
                    super.updateState(SALBAL_TEMPLATE_KEY, this.currentTemplate, false);
                } else {
                    this.currentTemplate = undefined;
                }
            });

        this.router.events
            .subscribe((event: any) => {
                if (event instanceof NavigationEnd) {
                    if (!this.currentTemplate) {
                        this.getTemplate();
                    }
                }
            });
    }

    public canDeactivate(): Observable<boolean> {
        if (!super.isDirty()) {
            return of(true);
        }

        return this.modalService.openUnsavedChangesModal().onClose.pipe(
            switchMap(modalResult => {
                if (modalResult === ConfirmActions.ACCEPT) {
                    return this.saveAll(() => {}, false);
                } else if (modalResult === ConfirmActions.REJECT) {
                    return of(true);
                } else {
                    return of(false);
                }
            })
        );
    }

    public previousTemplate() {
        this.canDeactivate()
            .filter(canDeactivate => canDeactivate)
            .switchMap(() => {
                return this.salarybalanceTemplateService.getPrevious(
                    this.currentTemplate.ID, ['Supplier.Info.DefaultBankAccount.AccountNumber']
                );
            })
            .subscribe((prev: SalaryBalanceTemplate) => {
                if (prev) {
                    this.currentTemplate = prev;
                    const childRoute = this.router.url.split('/').pop();
                    this.router.navigateByUrl(URL + prev.ID + '/' + childRoute);
                }
            }, err => this.errorService.handle(err));
    }

    public nextTemplate() {
        this.canDeactivate()
            .filter(canDeactivate => canDeactivate)
            .switchMap(() => {
                return this.salarybalanceTemplateService.getNext(
                    this.currentTemplate.ID, ['Supplier.Info.DefaultBankAccount.AccountNumber']
                );
            })
            .subscribe((next: SalaryBalanceTemplate) => {
                if (next) {
                    this.currentTemplate = next;
                    const childRoute = this.router.url.split('/').pop();
                    this.router.navigateByUrl(URL + next.ID + '/' + childRoute);
                }
            }, err => this.errorService.handle(err));
    }

    public newTemplate() {
        this.canDeactivate()
            .filter(canDeactivate => canDeactivate)
            .switchMap(() => {
                return this.salarybalanceTemplateService.GetNewEntity([''], 'salarybalancetemplate');
            })
            .subscribe(response => {
                if (response) {
                    this.currentTemplate = response;
                    const childRoute = this.router.url.split('/').pop();
                    this.router.navigateByUrl(URL + response.ID + '/' + childRoute);
                }
            }, err => this.errorService.handle(err));
    }

    private updateTab() {
        if (this.currentTemplate && this.currentTemplate.ID) {
            this.tabService.addTab({
                name: 'Trekkmal nr. ' + this.currentTemplate.ID,
                url: URL + this.currentTemplate.ID,
                moduleID: UniModules.SalarybalanceTemplates,
                active: true
            });
        } else {
            this.tabService.addTab({
                name: 'Ny trekkmal',
                url: URL + this.salarybalanceTemplateID,
                moduleID: UniModules.SalarybalanceTemplates,
                active: true
            });
        }
    }

    private checkDirty() {
        if (this.saveActions) {
            if (super.isDirty()) {
                this.saveActions[0].disabled = false;
            } else {
                this.saveActions[0].disabled = true;
            }
        }
    }

    private getTemplate() {
        this.salarybalanceTemplateService
            .getTemplate(this.salarybalanceTemplateID, ['Supplier.Info.DefaultBankAccount.AccountNumber'])
            .subscribe((salbalTemplate: SalaryBalanceTemplate) => {
                this.currentTemplate = salbalTemplate;
                super.updateState('salarybalancetemplate', salbalTemplate, false);
            },
        err => this.errorService.handle(err));
    }

    private setupSearchConfig(salbalTemplate: SalaryBalanceTemplate): IToolbarSearchConfig {
        return {
            lookupFunction: (query) => this.salarybalanceTemplateService.GetAll(
                `filter=ID ne ${salbalTemplate.ID} and (startswith(ID, '${query}') `
                + `or contains(Name, '${query}'))`
                + `&top=50&hateoas=false`
            ).catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            itemTemplate: (item: SalaryBalanceTemplate) => `${item.ID} - `
                + `${item.Name}`,
            initValue: (!salbalTemplate || !salbalTemplate.Name)
                ? 'Ny trekkmal'
                : `${salbalTemplate.ID} - ${salbalTemplate.Name || 'Trekkmal'}`,
            onSelect: selected => this.router.navigate([URL + selected.ID])
        };
    }

    private saveAll(done, updateView = true): Observable<boolean> {
        return Observable.combineLatest(
            super.getStateSubject(SALBAL_TEMPLATE_KEY),
            super.getStateSubject(SALARYBALANCES_ON_TEMPLATE_KEY)
        ).pipe(
            take(1),
            switchMap(data => {
                const [template, salBals] = data;
                if (template.Supplier && !template.Supplier.ID) {
                    template.Supplier = null;
                }

                return this.salarybalanceTemplateService.save(template, salBals);
            }),
            switchMap(savedTemplate => {
                this.salarybalanceService.invalidateCache();
                if (updateView) {
                    super.updateState(SALBAL_TEMPLATE_KEY, savedTemplate, false);
                }

                return savedTemplate.SalaryBalances && savedTemplate.SalaryBalances.length
                    ? this.getSalaryBalances(savedTemplate)
                    : super.getStateSubject(SALARYBALANCES_ON_TEMPLATE_KEY).pipe(take(1));
            }),
            catchError(err => {
                if (err === 'Lagring avbrutt') {
                    done('Lagring avbrutt');
                } else {
                    this.errorService.handle(err);
                    done('Lagring feilet');
                }

                return of(false);
            }),
            map(res => {
                if (!!res && updateView) {
                    const childRoute = this.router.url.split('/').pop();
                    this.router.navigateByUrl(URL + this.currentTemplate.ID + '/' + childRoute);
                    this.saveActions[0].disabled = true;
                    done('Lagring fullført');
                }
                return !!res;
            })
        );
    }

    private getSalaryBalances(template: SalaryBalanceTemplate) {
        return this.salarybalanceService
            .getSalarybalancesOnTemplate(template.ID)
            .do(salBals => super.updateState(SALARYBALANCES_ON_TEMPLATE_KEY, salBals, false));
    }
}
