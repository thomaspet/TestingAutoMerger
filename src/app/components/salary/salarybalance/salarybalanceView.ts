import { Component, ViewChild, OnDestroy } from '@angular/core';
import { UniView } from '../../../../framework/core/uniView';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { IUniSaveAction } from '../../../../framework/save/save';
import { IToolbarConfig } from '../../common/toolbar/toolbar';
import { TabService, UniModules } from '../../layout/navbar/tabstrip/tabService';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { SalaryBalance, SalBalType, CompanySalary } from '../../../unientities';
import { UniModalService, ConfirmActions } from '../../../../framework/uniModal/barrel';
import { IContextMenuItem } from '../../../../framework/ui/unitable/index';
import { SalarybalancelineModal } from './modals/salarybalancelinemodal';
import {UniPreviewModal} from '../../reports/modals/preview/previewModal';
import {
    UniCacheService,
    ErrorService,
    SalarybalanceService,
    ReportDefinitionService,
    CompanySalaryService,
    FileService
} from '../../../services/services';

@Component({
    selector: 'uni-salarybalance-view',
    templateUrl: './salarybalanceView.html'
})
export class SalarybalanceView extends UniView implements OnDestroy {
    private url: string = '/salary/salarybalances/';
    readonly SALARY_BALANCE_KEY: string = 'salarybalance'
    private salarybalanceID: number;
    private salarybalance: SalaryBalance;
    private saveActions: IUniSaveAction[];
    private toolbarConfig: IToolbarConfig;
    private childRoutes: any[];
    private contextMenuItems: IContextMenuItem[] = [];
    private subscriptions: Subscription[] = [];
    private companySalary: CompanySalary;

    public busy: boolean;

    @ViewChild(SalarybalancelineModal)
    private salarybalanceModal: SalarybalancelineModal;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private salarybalanceService: SalarybalanceService,
        private tabService: TabService,
        private errorService: ErrorService,
        protected cacheService: UniCacheService,
        private reportDefinitionService: ReportDefinitionService,
        private companySalaryService: CompanySalaryService,
        private fileService: FileService,
        private modalService: UniModalService
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

            super.getStateSubject(this.SALARY_BALANCE_KEY)
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
                super.updateState(this.SALARY_BALANCE_KEY, this.salarybalance, false);
            } else {
                this.salarybalance = undefined;
            }
        });

        this.subscriptions
            .push(this.router.events.subscribe((event: any) => {
                if (event instanceof NavigationEnd) {
                    if (!this.salarybalance) {
                        this.getSalarybalance();
                    }
                    this.refreshCompanySalary();
                }
            }));

    }

    public ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    public canDeactivate(): Observable<boolean> {

        if (!super.isDirty(this.SALARY_BALANCE_KEY)) {
            return Observable.of(true);
        }

        return this.modalService
            .openUnsavedChangesModal()
            .onClose
            .map((result: ConfirmActions) => {
                if (result === ConfirmActions.ACCEPT) {
                    this.saveSalarybalance(m => { }, false);
                }

                return result !== ConfirmActions.CANCEL;
            })
            .map(canDeactivate => {
                if (canDeactivate) {
                    this.cacheService.clearPageCache(this.cacheKey);
                } else {
                    this.updateTabStrip(this.salarybalanceID);
                }

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

    private saveSalarybalance(done: (message: string) => void, updateView = true) {
        this.handlePaymentCreation(this.salarybalance)
            .switchMap(salaryBalance => this.salarybalanceService.save(salaryBalance))
            .do(salaryBalance => {
                if (this.salarybalance['_newFiles'] && this.salarybalance['_newFiles'].length > 0) {
                    this.linkNewFiles(salaryBalance.ID, this.salarybalance['_newFiles'], 'SalaryBalance')
                }

                if (!salaryBalance['CreatePayment'] && this.salarybalance.InstalmentType === SalBalType.Advance) {
                    this.showAdvanceReport(salaryBalance.ID);
                }
            })
            .subscribe((salbal: SalaryBalance) => {
                if (updateView) {
                    super.updateState('salarybalance', salbal, false);
                    let childRoute = this.router.url.split('/').pop();
                    this.router.navigateByUrl(this.url + salbal.ID + '/' + childRoute);
                    done('Lagring fullført');
                    this.saveActions[0].disabled = true;
                }
            }, err => {
                this.errorService.handle(err);
                done('Lagring feilet');
            });
    }

    private linkNewFiles(ID: any, fileIDs: Array<any>, entityType: string): Promise<any> {
        return new Promise((resolve, reject) => {
            fileIDs.forEach(fileID => {
                this.fileService.linkFile(entityType, ID, fileID).subscribe(x => resolve(x));
            });
        });
    }

    private handlePaymentCreation(salaryBalance: SalaryBalance): Observable<SalaryBalance> {
        if (salaryBalance.ID || !this.salarybalanceService.hasBalance(salaryBalance)) {
            return Observable.of(salaryBalance);
        }

        const modal = this.modalService.confirm({
            header: 'Opprett utbetaling',
            message: 'Vil du opprette en utbetalingspost av dette forskuddet?',
            buttonLabels: {
                accept: 'Opprett',
                cancel: 'Avbryt'
            }
        });

        return modal.onClose.map(response => {
            salaryBalance.CreatePayment = response === ConfirmActions.ACCEPT;
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
                report.parameters = [{Name: 'SalaryBalanceID', value: id}];
                this.modalService.open(UniPreviewModal, {
                    data: report
                }).onClose.subscribe(() => {});
            });
    }

    private refreshCompanySalary() {
        this.getCompanySalary()
            .subscribe(compSal => super.updateState('CompanySalary', compSal, false));
    }

    private getCompanySalary(): Observable<CompanySalary> {
        return this.companySalary
            ? Observable.of(this.companySalary)
            : this.companySalaryService.getCompanySalary();
    }
}
