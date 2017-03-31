import {Component, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ReportDefinition, UniQueryDefinition} from '../../../unientities';
import {ReportDefinitionService, UniQueryDefinitionService, ErrorService} from '../../../services/services';
import {ParameterModal} from '../modals/parameter/parameterModal';
import {PreviewModal} from '../modals/preview/previewModal';
import {Report} from '../../../models/reports/report';
import {BalanceReportFilterModal} from '../modals/balanceList/BalanceReportFilterModal';
import {PostingJournalReportFilterModal} from '../modals/postingJournal/PostingJournalReportFilterModal';
import {ResultAndBalanceReportFilterModal} from '../modals/resultAndBalance/ResultAndBalanceReportFilterModal';
import {BalanceGeneralLedgerFilterModal} from '../modals/balanceGeneralLedgerFilter/BalanceGeneralLedgerFilterModal';
import {CustomerAccountReportFilterModal} from '../modals/customerAccountReportFilter/CustomerAccountReportFilterModal';
import {SupplierAccountReportFilterModal} from '../modals/supplierAccountReportFilter/SupplierAccountReportFilterModal';
import {AccountReportFilterModal} from '../modals/account/AccountReportFilterModal';
import {SalaryPaymentListReportFilterModal} from '../modals/salaryPaymentList/salaryPaymentListReportFilterModal';
import {VacationPayBaseReportFilterModal} from '../modals/vacationPayBase/vacationPayBaseReportFilterModal';
import {SalaryWithholdingAndAGAReportFilterModal} from '../modals/salaryWithholdingAndAGA/salaryWithholdingAndAGAReportFilterModal';
import {PayCheckReportFilterModal} from '../modals/paycheck/paycheckReportFilterModal';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';

class ReportCategory {
    public name: string;
    public reports: Array<any>;
    public priority: number;
}

@Component({
    selector: 'uni-overview',
    templateUrl: './overview.html'
})
export class Overview {
    @ViewChild(ParameterModal)
    private parameterModal: ParameterModal;
    @ViewChild(PreviewModal)
    private previewModal: PreviewModal;
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
    public reportCategories: Array<ReportCategory>;

    constructor(
        private tabService: TabService,
        private reportDefinitionService: ReportDefinitionService,
        private uniQueryDefinitionService: UniQueryDefinitionService,
        private router: Router,
        private errorService: ErrorService
) {
        this.tabService.addTab({ name: 'Rapportoversikt', url: '/reports/overview', moduleID: UniModules.Reports, active: true });
    }

    public showModalReportParameters(report: ReportDefinition) {
        this.parameterModal.open(report, this.previewModal);
    }

    public showBalanceListModalReportParameters(report: ReportDefinition) {
        this.balanceListModal.open(report, this.previewModal);
    }

    public showModalAccountReportFilterModal(report: ReportDefinition) {
        this.accountReportFilterModal.open(report, this.previewModal);
    }
    public showPostingJournalModalReportParameters(report: ReportDefinition) {
        this.postingJournalModal.open(report, this.previewModal);
    }

    public showResultAndBalanceModalReportParameters(report: ReportDefinition) {
        this.resultAndBalanceModal.open(report, this.previewModal);
    }

    public showBalanceGeneralLedgerFilterModal(report: ReportDefinition) {
        this.balanceGeneralLedgerFilterModal.open(report, this.previewModal);
    }

    public showCustomerAccountModalReportParameters(report: ReportDefinition) {
        this.customerAccountModal.open(report, this.previewModal);
    }

    public showSupplierAccountModalReportParameters(report: ReportDefinition) {
        this.supplierAccountModal.open(report, this.previewModal);
    }

    public showSalaryPaymentListOrPostingSummaryModalReportParameters(report: ReportDefinition) {
        this.salaryPaymentListFilterModal.open(report, this.previewModal);
    }

    public showVacationBaseFilterModalReportParameters(report: ReportDefinition) {
        this.vacationBaseFilterModal.open(report, this.previewModal);
    }

    public showSalaryWithholdingAndAgaFilterModalReportParameters(report: ReportDefinition) {
        this.salaryWithholdingAndAGAReportFilterModal.open(report, this.previewModal);
    }

    public showPaycheckFilterModalReportParameters(report: ReportDefinition) {
        this.paycheckReportFilterModal.open(report, this.previewModal);
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

            this.reportCategories = new Array<ReportCategory>();

            for (const report of reportAndQueries) {
                // array contains both reports and uniqueries, display visible reports and all uniqueries (for now)
                if (report.Visible || report.IsQuery) {
                    let reportName = report.Category || report.MainModelName;
                    let reportCategory: ReportCategory = this.reportCategories.find(category => category.name === reportName);

                    if (typeof reportCategory === 'undefined') {
                        reportCategory = new ReportCategory();

                        reportCategory.name = reportName;
                        reportCategory.reports = new Array<Report>();
                        reportCategory.priority = this.priorityByCategoryName(reportCategory.name);

                        this.reportCategories.push(reportCategory);
                    }

                    reportCategory.reports.push(report);
                }
            }

            this.reportCategories.sort((a, b) => a.priority - b.priority);
        }, err => this.errorService.handle(err));
    }

    private priorityByCategoryName(name: string): number {
        switch (name) {
            case 'Faktura':
            case 'Tilbud':
            case 'Ordre':
                return 1;
            default:
                return 0;
        }
    }
}
