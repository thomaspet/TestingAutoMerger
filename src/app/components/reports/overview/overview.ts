import {Component, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ReportDefinition} from '../../../unientities';
import {ReportDefinitionService} from '../../../services/services';
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

class ReportCategory {
    public name: string;
    public reports: Array<ReportDefinition>;
}

@Component({
    selector: 'uni-overview',
    templateUrl: 'app/components/reports/overview/overview.html'
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

    public reportCategories: Array<ReportCategory>;

    constructor(private tabService: TabService, private reportDefinitionService: ReportDefinitionService) {
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

    public ngOnInit() {
        this.reportDefinitionService.GetAll<ReportDefinition>(null).subscribe(reports => {
            this.reportCategories = new Array<ReportCategory>();

            for (const report of reports) {
                let reportCategory: ReportCategory = this.reportCategories.find(category => category.name === report.Category);

                if (typeof reportCategory === 'undefined') {
                    reportCategory = new ReportCategory();

                    reportCategory.name = report.Category;
                    reportCategory.reports = new Array<Report>();

                    this.reportCategories.push(reportCategory);
                }
                reportCategory.reports.push(report);
            }
        });
    }
}
