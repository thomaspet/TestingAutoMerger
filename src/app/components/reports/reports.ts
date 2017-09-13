import {Component, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {ReportDefinition, UniQueryDefinition} from '../../unientities';
import {ReportDefinitionService, UniQueryDefinitionService, ErrorService} from '../../services/services';
import {Report} from '../../models/reports/report';
import {ParameterModal} from './modals/parameter/parameterModal';
import {BalanceReportFilterModal} from './modals/balanceList/BalanceReportFilterModal';
import {PostingJournalReportFilterModal} from './modals/postingJournal/PostingJournalReportFilterModal';
import {ResultAndBalanceReportFilterModal} from './modals/resultAndBalance/ResultAndBalanceReportFilterModal';
import {BalanceGeneralLedgerFilterModal} from './modals/balanceGeneralLedgerFilter/BalanceGeneralLedgerFilterModal';
import {CustomerAccountReportFilterModal} from './modals/customerAccountReportFilter/CustomerAccountReportFilterModal';
import {SupplierAccountReportFilterModal} from './modals/supplierAccountReportFilter/SupplierAccountReportFilterModal';
import {AccountReportFilterModal} from './modals/account/AccountReportFilterModal';
import {SalaryPaymentListReportFilterModal} from './modals/salaryPaymentList/salaryPaymentListReportFilterModal';
import {VacationPayBaseReportFilterModal} from './modals/vacationPayBase/vacationPayBaseReportFilterModal';
import {SalaryWithholdingAndAGAReportFilterModal} from './modals/salaryWithholdingAndAGA/salaryWithholdingAndAGAReportFilterModal';
import {PayCheckReportFilterModal} from './modals/paycheck/paycheckReportFilterModal';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';

class ReportCategories {
    public sale: Array<Array<Report>> = [[], [], []];
    public accounting: Array<Array<Report>> = [[], [], []];
    public salary: Array<Array<Report>> = [[]];
    public custom: Array<Array<Report>> = [];
}

@Component({
    selector: 'uni-reports',
    templateUrl: './reports.html'
})
export class UniReports {
    // TODO: rewrite old modals..
    @ViewChild(ParameterModal)
    private parameterModal: ParameterModal;

    @ViewChild(BalanceReportFilterModal) 
    private balanceListModal: BalanceReportFilterModal;

    @ViewChild(AccountReportFilterModal) 
    private accountReportFilterModal: AccountReportFilterModal;
    
    @ViewChild(PostingJournalReportFilterModal) 
    private postingJournalModal: PostingJournalReportFilterModal;
    
    @ViewChild(ResultAndBalanceReportFilterModal) 
    private resultAndBalanceModal: ResultAndBalanceReportFilterModal;
    
    @ViewChild(BalanceGeneralLedgerFilterModal) 
    private balanceGeneralLedgerFilterModal: BalanceGeneralLedgerFilterModal;
    
    @ViewChild(CustomerAccountReportFilterModal) 
    private customerAccountModal: CustomerAccountReportFilterModal;
    
    @ViewChild(SupplierAccountReportFilterModal) 
    private supplierAccountModal: SupplierAccountReportFilterModal;
    
    @ViewChild(SalaryPaymentListReportFilterModal) 
    private salaryPaymentListFilterModal: SalaryPaymentListReportFilterModal;
    
    @ViewChild(VacationPayBaseReportFilterModal) 
    private vacationBaseFilterModal: VacationPayBaseReportFilterModal;
    
    @ViewChild(SalaryWithholdingAndAGAReportFilterModal) 
    private salaryWithholdingAndAGAReportFilterModal: SalaryWithholdingAndAGAReportFilterModal;
    
    @ViewChild(PayCheckReportFilterModal) 
    private paycheckReportFilterModal: PayCheckReportFilterModal;

    public reportCategories: ReportCategories = new ReportCategories();
    public tabs: string[] = ['Salg', 'Regnskap', 'Lønn', 'Egendefinert'];
    public activeTabIndex: number = 0;
    public activeCategory: Array<any>;

    constructor(
        private tabService: TabService,
        private reportDefinitionService: ReportDefinitionService,
        private uniQueryDefinitionService: UniQueryDefinitionService,
        private router: Router,
        private errorService: ErrorService
    ) {
        this.tabService.addTab({
            name: 'Rapportoversikt',
            url: '/reports',
            moduleID: UniModules.Reports,
            active: true
        });
    }

    public showModalReportParameters(report: ReportDefinition) {
        this.parameterModal.open(report);
    }

    public showBalanceListModalReportParameters(report: ReportDefinition) {
        this.balanceListModal.open(report);
    }

    public showModalAccountReportFilterModal(report: ReportDefinition) {
        this.accountReportFilterModal.open(report);
    }
    public showPostingJournalModalReportParameters(report: ReportDefinition) {
        this.postingJournalModal.open(report);
    }

    public showResultAndBalanceModalReportParameters(report: ReportDefinition) {
        this.resultAndBalanceModal.open(report);
    }

    public showBalanceGeneralLedgerFilterModal(report: ReportDefinition) {
        this.balanceGeneralLedgerFilterModal.open(report);
    }

    public showCustomerAccountModalReportParameters(report: ReportDefinition) {
        this.customerAccountModal.open(report);
    }

    public showSupplierAccountModalReportParameters(report: ReportDefinition) {
        this.supplierAccountModal.open(report);
    }

    public showSalaryPaymentListOrPostingSummaryModalReportParameters(report: ReportDefinition) {
        this.salaryPaymentListFilterModal.open(report);
    }

    public showVacationBaseFilterModalReportParameters(report: ReportDefinition) {
        this.vacationBaseFilterModal.open(report);
    }

    public showSalaryWithholdingAndAgaFilterModalReportParameters(report: ReportDefinition) {
        this.salaryWithholdingAndAGAReportFilterModal.open(report);
    }

    public showPaycheckFilterModalReportParameters(report: ReportDefinition) {
        this.paycheckReportFilterModal.open(report);
    }

    public showUniQuery(report: UniQueryDefinition) {
        this.router.navigateByUrl('/uniqueries/details/' + report.ID);
    }

    public ngOnInit() {
        Observable.forkJoin(
            this.reportDefinitionService.GetAll<ReportDefinition>(null),
            this.uniQueryDefinitionService.GetAll<UniQueryDefinition>(null)
        ).subscribe(response => {
            response[0].forEach(x => x.IsReport = true);
            response[1].forEach(x => x.IsQuery = true);
            let reportAndQueries = response[0].concat(response[1]);

            let customCategories: Array<string> = [];

            for (const report of reportAndQueries) {
                if (report.Visible || report.IsQuery) {
                    // If the custom report category == a regular category, placing this code outside the switch adds
                    // the report to both the custom AND the according regular category
                    if (report.Category === null 
                        || ((report.Category.search('Sales') 
                            && report.Category.search('Accounting') 
                            && report.Category.search('Salary')) === -1)) {
                                if (report.Category === null) {
                                    report.Category = 'Ukategorisert';
                                }
                                if (!customCategories.find(category => category === report.Category)) {
                                    
                                    customCategories.push(report.Category);
                                    this.reportCategories.custom.push([]);
                                }
                                this.reportCategories.custom[customCategories.indexOf(report.Category)].push(report);
                    }
                    switch (report.Category) {            
                        case 'Sales.Quote':
                        case 'Tilbud':
                            report.Category = 'Tilbud';
                            this.reportCategories.sale[0].push(report);
                            break;
                        case 'Sales.Order':
                        case 'Ordre':
                            report.Category = 'Ordre';
                            this.reportCategories.sale[1].push(report);
                            break;
                        case 'Sales.Invoice':
                        case 'Faktura':
                            report.Category = 'Faktura';
                            this.reportCategories.sale[2].push(report);
                            break;
                        case 'Accounting.AccountStatement':
                        case 'Kontoutskrifter':
                            report.Category = 'Kontoutskrifter';
                            this.reportCategories.accounting[0].push(report);
                            break;
                        case 'Accounting.Balance':
                        case 'Saldolister':
                            report.Category = 'Saldolister';
                            this.reportCategories.accounting[1].push(report);
                            break;
                        case 'Accounting.Result':
                        case 'Resultat':
                            report.Category = 'Resultat';
                            this.reportCategories.accounting[2].push(report);
                            break;
                        case 'Salary':
                        case 'Lønn':
                            report.Category = 'Lønn';
                            this.reportCategories.salary[0].push(report);
                            break;
                        
                    }
                }
            }
            this.activeCategory = this.reportCategories.sale;
        }, err => this.errorService.handle(err));
    }

    private onTabSelection() {
        switch (this.activeTabIndex) {
            case 0:
                return this.activeCategory = this.reportCategories.sale;
            case 1:
                return this.activeCategory = this.reportCategories.accounting;
            case 2:
                return this.activeCategory = this.reportCategories.salary;
            case 3:
                return this.activeCategory = this.reportCategories.custom;
        }
    }
}
