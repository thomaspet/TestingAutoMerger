import { Component, ViewChild } from '@angular/core';
import { UniView } from '../../../../framework/core/uniView';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { IUniSaveAction } from '../../../../framework/save/save';
import { IToolbarConfig } from '../../common/toolbar/toolbar';
import { UniCacheService, ErrorService, SalarybalanceService, ReportDefinitionService } from '../../../services/services';
import { TabService, UniModules } from '../../layout/navbar/tabstrip/tabService';
import { Observable } from 'rxjs/Observable';
import { SalaryBalance, SalBalType } from '../../../unientities';
import { UniConfirmModal, ConfirmActions } from '../../../../framework/modals/confirm';
import { IContextMenuItem } from 'unitable-ng2/main';
import { SalarybalancelineModal } from './modals/salarybalancelinemodal';
import { PreviewModal } from '../../reports/modals/preview/previewModal';

@Component({
    selector: 'uni-salarybalance-view',
    templateUrl: './salarybalanceView.html'
})
export class SalarybalanceView extends UniView {

    private url: string = '/salary/salarybalances/';
    private salarybalanceID: number;
    private salarybalance: SalaryBalance;
    private saveActions: IUniSaveAction[];
    private toolbarConfig: IToolbarConfig;
    private childRoutes: any[];
    private contextMenuItems: IContextMenuItem[] = [];

    public busy: boolean;

    @ViewChild(UniConfirmModal) public confirmModal: UniConfirmModal;
    @ViewChild(SalarybalancelineModal) private salarybalanceModal: SalarybalancelineModal;
    @ViewChild(PreviewModal) private previewModal: PreviewModal;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private salarybalanceService: SalarybalanceService,
        private tabService: TabService,
        private errorService: ErrorService,
        protected cacheService: UniCacheService,
        private reportDefinitionService: ReportDefinitionService
    ) {
        super(router.url, cacheService);

        this.childRoutes = [
            { name: 'Detaljer', path: 'details' }
        ];

        this.saveActions = [{
            label: 'Lagre',
            action: this.saveSalarybalance.bind(this),
            main: true,
            disabled: true
        }];

        this.route.params.subscribe((params) => {
            this.salarybalanceID = +params['id'];
            this.updateTabStrip(this.salarybalanceID);
            this.contextMenuItems = [];

            super.updateCacheKey(this.router.url);

            super.getStateSubject('salarybalance')
                .do(salaryBalance => {
                    if (!this.contextMenuItems.length) {
                        this.contextMenuItems = [
                            {
                                label: 'Legg til manuell post',
                                action: () => this.openSalarybalancelineModal(),
                                disabled: () => this.salarybalanceID < 1 || !salaryBalance
                            },
                            {
                                label: 'Vis forskuddskvittering',
                                action: () => this.showAdvanceReport(this.salarybalanceID),
                                disabled: () => !this.salarybalanceID
                                    || !this.salarybalanceService.hasBalance(salaryBalance)
                            }
                        ];
                    }
                })
                .subscribe((salarybalance: SalaryBalance) => {
                    this.salarybalance = salarybalance;
                    this.toolbarConfig = {
                        title: this.salarybalance.ID ? this.salarybalance.Name : 'Nytt forskudd/trekk',
                        subheads: [{
                            title: this.salarybalance.ID ? 'Saldo nr. ' + this.salarybalance.ID : null
                        }],
                        navigation: {
                            prev: this.previousSalarybalance.bind(this),
                            next: this.nextSalarybalance.bind(this),
                            add: this.newSalarybalance.bind(this)
                        }
                    };

                    this.checkDirty();
                }, err => this.errorService.handle(err));

            if (this.salarybalance && this.salarybalance.ID === +params['id']) {
                super.updateState('salarybalance', this.salarybalance, false);
            } else {
                this.salarybalance = undefined;
            }
        });

        this.router.events.subscribe((event: any) => {
            if (event instanceof NavigationEnd) {
                if (!this.salarybalance) {
                    this.getSalarybalance();
                }
            }
        });

    }

    public canDeactivate(): Observable<boolean> {
        return Observable
            .of(!super.isDirty())
            .flatMap(result => {
                return result
                    ? Observable.of(result)
                    : Observable
                        .fromPromise(
                        this.confirmModal.confirm(
                            'Du har ulagrede endringer, ønsker du å lagre disse før du fortsetter?',
                            'Lagre endringer?', true, { accept: 'Lagre', reject: 'Forkast' }))
                        .map((response: ConfirmActions) => {
                            if (response === ConfirmActions.ACCEPT) {
                                this.saveSalarybalance((m) => { });
                                return true;
                            } else if (response === ConfirmActions.REJECT) {
                                if (!this.salarybalanceID) {
                                    let tabIndex = this.tabService.tabs
                                        .findIndex(x => x.moduleID === UniModules.Salarybalances);
                                    this.tabService.removeTab(
                                        this.tabService.tabs[tabIndex],
                                        tabIndex);
                                }
                                return true;
                            } else {
                                return false;
                            }
                        });
            })
            .map(canDeactivate => {
                canDeactivate
                    ? this.cacheService.clearPageCache(this.cacheKey)
                    : this.updateTabStrip(this.salarybalanceID);

                return canDeactivate;
            });
    }

    public previousSalarybalance() {
        this.canDeactivate().subscribe(canDeactivate => {
            if (canDeactivate) {
                this.salarybalanceService.getPrevious(this.salarybalance.ID)
                    .subscribe((prev: SalaryBalance) => {
                        if (prev) {
                            this.salarybalance = prev;
                            let childRoute = this.router.url.split('/').pop();
                            this.router.navigateByUrl(this.url + prev.ID + '/' + childRoute);
                        }
                    }, err => this.errorService.handle(err));
            }
        });
    }

    public nextSalarybalance() {
        this.canDeactivate().subscribe(canDeactivate => {
            if (canDeactivate) {
                this.salarybalanceService.getNext(this.salarybalance.ID)
                    .subscribe((next: SalaryBalance) => {
                        if (next) {
                            this.salarybalance = next;
                            let childRoute = this.router.url.split('/').pop();
                            this.router.navigateByUrl(this.url + next.ID + '/' + childRoute);
                        }
                    }, err => this.errorService.handle(err));
            }
        });
    }

    public newSalarybalance() {
        this.canDeactivate().subscribe(canDeactivate => {
            if (canDeactivate) {
                this.salarybalanceService.GetNewEntity().subscribe((response) => {
                    if (response) {
                        this.salarybalance = response;
                        let childRoute = this.router.url.split('/').pop();
                        this.router.navigateByUrl(this.url + response.ID + '/' + childRoute);
                    }
                }, err => this.errorService.handle(err));
            }
        });
    }

    public openSalarybalancelineModal() {
        this.salarybalanceModal.openModal(this.salarybalance, false);
    }

    private getSalarybalance() {
        this.salarybalanceService.getSalarybalance(this.salarybalanceID,
            ['Transactions', 'Employee', 'Employee.BusinessRelationInfo',
                'Supplier', 'Supplier.Info', 'Supplier.Info.DefaultBankAccount'])
            .subscribe((salbal: SalaryBalance) => {
                this.salarybalance = salbal;
                super.updateState('salarybalance', salbal, false);
            }, err => this.errorService.handle(err));
    }

    private saveSalarybalance(done: (message: string) => void) {

        this.handlePaymentCreation(this.salarybalance)
            .switchMap(salaryBalance => this.salarybalanceService.save(salaryBalance))
            .do(salaryBalance => {
                if (!salaryBalance['CreatePayment'] && this.salarybalanceService.hasBalance(salaryBalance)) {
                    this.showAdvanceReport(salaryBalance.ID);
                }
            })
            .subscribe((salbal: SalaryBalance) => {
                super.updateState('salarybalance', salbal, false);
                let childRoute = this.router.url.split('/').pop();
                this.router.navigateByUrl(this.url + salbal.ID + '/' + childRoute);
                done('Lagring fullført');
                this.saveActions[0].disabled = true;
            }, err => {
                this.errorService.handle(err);
                done('Lagring feilet');
            });
    }

    private handlePaymentCreation(salaryBalance: SalaryBalance): Observable<SalaryBalance> {
        return Observable
            .of(!salaryBalance.ID && this.salarybalanceService.hasBalance(salaryBalance))
            .switchMap(promptUser => promptUser
                ? Observable.fromPromise(this.confirmModal
                    .confirm('Vil du opprette en utbetalingspost av dette forskuddet?', 'Utbetaling', false))
                    .map(response => response === ConfirmActions.ACCEPT)
                : Observable.of(false))
            .map(createPayment => {
                salaryBalance['CreatePayment'] = createPayment;
                return salaryBalance;
            });
    }

    private updateTabStrip(salarybalanceID: number) {
        if (salarybalanceID) {
            this.tabService.addTab({
                name: 'Saldonr. ' + salarybalanceID,
                url: this.url + salarybalanceID,
                moduleID: UniModules.Salarybalances,
                active: true
            });
        } else {
            this.tabService.addTab({
                name: 'Ny saldo',
                url: this.url + salarybalanceID,
                moduleID: UniModules.Salarybalances,
                active: true
            });
        }
    }

    private checkDirty() {
        if (super.isDirty()) {
            this.saveActions[0].disabled = false;
        } else {
            this.saveActions[0].disabled = true;
        }
    }

    private showAdvanceReport(id: number) {
        this.reportDefinitionService
            .getReportByName('Forskuddskvittering')
            .subscribe(report => {
                this.previewModal.openWithId(report, id, 'SalaryBalanceID');
            });
    }
}
