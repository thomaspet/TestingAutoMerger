import {Component, OnDestroy} from '@angular/core';
import {UniView} from '../../../../framework/core/uniView';
import {ActivatedRoute, Router} from '@angular/router';
import {IUniSaveAction} from '../../../../framework/save/save';
import {IToolbarConfig, IToolbarSearchConfig} from '../../common/toolbar/toolbar';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {SalaryBalance, SalBalType} from '../../../unientities';
import {UniModalService, ConfirmActions} from '../../../../framework/uniModal/barrel';
import {IContextMenuItem} from '../../../../framework/ui/unitable/index';
import {SalaryBalanceLineModal} from './modals/salBalLineModal';
import {UniPreviewModal} from '../../reports/modals/preview/previewModal';
import {SalaryBalanceViewService} from './services/salaryBalanceViewService';
import {
    UniCacheService,
    ErrorService,
    SalarybalanceService,
    ReportDefinitionService,
    CompanySalaryService,
    FileService,
    WageTypeService,
    EmployeeService,
    SupplierService
} from '../../../services/services';

const SALARY_BALANCE_KEY = 'salarybalance';

@Component({
    selector: 'uni-salarybalance-view',
    templateUrl: './salarybalanceView.html'
})
export class SalarybalanceView extends UniView implements OnDestroy {
    private url: string = '/salary/salarybalances/';
    private salarybalanceID: number;
    private salarybalance: SalaryBalance;
    private saveActions: IUniSaveAction[];
    private toolbarConfig: IToolbarConfig;
    private childRoutes: any[];
    private contextMenuItems: IContextMenuItem[] = [];
    public searchConfig$: BehaviorSubject<IToolbarSearchConfig> = new BehaviorSubject(null);
    private subscriptions: Subscription[] = [];

    public busy: boolean;

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
        private modalService: UniModalService,
        private wageTypeService: WageTypeService,
        private employeeService: EmployeeService,
        private supplierService: SupplierService,
        private salaryBalanceViewService: SalaryBalanceViewService
    ) {
        super(router.url, cacheService);

        this.childRoutes = [
            {name: 'Detaljer', path: 'details'}
        ];

        this.saveActions = [{
            label: 'Lagre',
            action: this.saveSalarybalance.bind(this),
            main: true,
            disabled: true
        }];

        this.route
            .params
            .do(() => this.subscriptions.forEach(sub => sub.unsubscribe()))
            .do(params => {
                this.salarybalanceID = +params['id'];
                this.updateTabStrip(this.salarybalanceID);
                this.contextMenuItems = [];
                this.setupCache(this.salarybalanceID);
            })
            .map(params => {
                if (this.salarybalance && this.salarybalance.ID === +params['id']) {
                    super.updateState(SALARY_BALANCE_KEY, this.salarybalance, false);
                } else {
                    this.salarybalance = undefined;
                }
                return params;
            })
            .map((params) => this.salarybalance)
            .filter(salaryBalance => !salaryBalance)
            .subscribe(salaryBalance => this.getSalarybalance());
    }

    public ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    public canDeactivate(): Observable<boolean> {

        let obs = !super.isDirty(SALARY_BALANCE_KEY)
            ? Observable.of(ConfirmActions.REJECT)
            : this.modalService.openUnsavedChangesModal().onClose;

        return obs
            .map((result: ConfirmActions) => {
                if (result === ConfirmActions.ACCEPT) {
                    this.saveSalarybalance(m => {}, false);
                }

                return result !== ConfirmActions.CANCEL;
            })
            .map(canDeactivate => {
                if (canDeactivate) {
                    this.cacheService.clearPageCache(this.cacheKey);
                    if (!this.salarybalanceID) {
                        this.salarybalanceService.invalidateCache();
                    }
                }

                return canDeactivate;
            });
    }

    private setupCache(salarybalanceID: number) {
        super.updateCacheKey(this.router.url);

        let sub = super.getStateSubject(SALARY_BALANCE_KEY)
            .do(salaryBalance => {
                if (this.contextMenuItems.length) {
                    return;
                }

                this.contextMenuItems = [
                    {
                        label: 'Legg til manuell post',
                        action: () => this.openSalarybalancelineModal(),
                        disabled: () => salarybalanceID < 1 || !salaryBalance
                    },
                    {
                        label: 'Vis forskuddskvittering',
                        action: () => this.showAdvanceReport(salarybalanceID),
                        disabled: () => !salarybalanceID
                            || !this.salarybalanceService.hasBalance(salaryBalance)
                    }
                ];

                this.searchConfig$.next(this.salaryBalanceViewService.setupSearchConfig(salaryBalance));
            })
            .do((salbal) => this.salarybalance = salbal)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .do((salarybalance: SalaryBalance) => {
                this.toolbarConfig = {
                    navigation: {
                        prev: this.previousSalarybalance.bind(this),
                        next: this.nextSalarybalance.bind(this),
                        add: this.newSalarybalance.bind(this)
                    }
                };
            })
            .subscribe((salarybalance: SalaryBalance) => this.checkDirty());

        this.subscriptions.push(sub);
    }

    public previousSalarybalance() {
        this.canDeactivate()
            .take(1)
            .subscribe(canDeactivate => {
                if (!canDeactivate) {
                    return;
                }
                this.salarybalanceService
                    .getPrevious(this.salarybalance.ID)
                    .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                    .subscribe(prev => this.handleNextPreviousNewSalaryBalance(prev));
            });
    }

    public nextSalarybalance() {
        this.canDeactivate()
            .take(1)
            .subscribe(canDeactivate => {
                if (!canDeactivate) {
                    return;
                }
                this.salarybalanceService
                    .getNext(this.salarybalance.ID)
                    .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                    .subscribe(next => this.handleNextPreviousNewSalaryBalance(next));
            });
    }

    public newSalarybalance() {
        this.canDeactivate()
            .take(1)
            .subscribe(canDeactivate => {
                if (!canDeactivate) {
                    return;
                }

                this.salarybalanceService
                    .GetNewEntity()
                    .switchMap(salBal => {
                        return this.companySalaryService
                            .getCompanySalary()
                            .map(compSal => {
                                salBal.CreatePayment = compSal.RemitRegularTraits;
                                return salBal;
                            });
                    })
                    .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                    .subscribe((response) => this.handleNextPreviousNewSalaryBalance(response));

            });
    }

    public handleNextPreviousNewSalaryBalance(salBal: SalaryBalance) {
        if (!salBal) {
            return;
        }
        this.salarybalance = salBal;
        let childRoute = this.router.url.split('/').pop();
        this.router.navigateByUrl(this.url + salBal.ID + '/' + childRoute);
    }

    public openSalarybalancelineModal() {
        this.modalService
            .open(
            SalaryBalanceLineModal,
            {
                data: this.salarybalance
            })
            .onClose
            .subscribe(needsUpdate => {
                if (needsUpdate) {
                    this.getSalarybalance();
                }
            });
    }

    private getSalarybalance() {
        this.salarybalanceService.getSalarybalance(this.salarybalanceID,
            ['Transactions', 'Employee', 'Employee.BusinessRelationInfo',
                'Supplier', 'Supplier.Info', 'Supplier.Info.DefaultBankAccount'])
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .switchMap(salBal => salBal.ID
                ? Observable.of(salBal)
                : this.companySalaryService.getCompanySalary()
                    .map(compSal => {
                        salBal.CreatePayment = compSal.RemitRegularTraits;
                        return salBal;
                    }))
            .subscribe((salbal: SalaryBalance) => super.updateState(SALARY_BALANCE_KEY, salbal, false));
    }

    private saveSalarybalance(done: (message: string) => void, updateView = true) {
        this.handlePaymentCreation(this.salarybalance)
            .switchMap(salaryBalance => this.salarybalanceService.save(salaryBalance))
            .do(salaryBalance => {
                if (this.salarybalance['_newFiles'] && this.salarybalance['_newFiles'].length > 0) {
                    this.linkNewFiles(salaryBalance.ID, this.salarybalance['_newFiles'], 'SalaryBalance');
                }

                if (!salaryBalance['CreatePayment'] && this.salarybalance.InstalmentType === SalBalType.Advance) {
                    this.showAdvanceReport(salaryBalance.ID);
                }
            })
            .subscribe((salbal: SalaryBalance) => {
                if (updateView) {
                    super.updateState(SALARY_BALANCE_KEY, salbal, false);
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
                });
            });
    }
}
