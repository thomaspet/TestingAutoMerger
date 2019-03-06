// Angular imports
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';

// App imports
import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {WidgetModule} from '../widgets/widgetModule';

// routes
import {accountingRoutes} from './accountingRoutes';

// specific imports
import {UniAccounting} from './accounting';
import {JournalEntryProfessional} from './journalentry/components/journalentryprofessional/journalentryprofessional';
import {JournalEntryManual} from './journalentry/journalentrymanual/journalentrymanual';
import {CheckListVat} from './vatreport/checkList/checkList';
import {VatReportJournalEntry} from './vatreport/JournalEntry/vatReportJournalEntry';
import {CreateCorrectedVatReportForm} from './vatreport/modals/createCorrectedVatReport';
import {SelectJournalEntryLineModal} from './journalentry/components/selectJournalEntryLineModal';
import {ReceiptVat} from './vatreport/receipt/receipt';
import {VatSummaryPerPost} from './vatreport/reportSummary/reportSummary';
import {TransqueryDetails} from './transquery/transqueryDetails';
import {JournalEntries} from './journalentry/journalentries/journalentries';
import {Payments} from './journalentry/payments/payments';
import {VatReportView} from './vatreport/vatreportview';
import {JournalEntry} from './journalentry/journalentry';
import {ResultReport} from './accountingreports/resultreport/resultreport';
import {DimensionResultReport} from './accountingreports/dimensionreport/dimensionresultreport';
import {DimensionTypeReport} from './accountingreports/dimensionreport/dimensiontypereport';
import {AccountingReportShortcuts} from './accountingreports/reportshortcuts';
import {AccountingReports} from './accountingreports/accountingreports';
import {BalanceReport} from './accountingreports/balancereport/balancereport';
import {AccountDetailsReportModal} from './accountingreports/detailsmodal/accountDetailsReportModal';
import {AccountDetailsReport} from './accountingreports/detailsmodal/accountDetailsReport';
import {PeriodPicker} from './accountingreports/periodFilter/periodpicker';
import {DrilldownResultReportPart} from './accountingreports/reportparts/drilldownResultReportPart';
import {
    DistributionPeriodReportPart,
    NumberAsMoneyPipe
} from './accountingreports/reportparts/distributionPeriodReportPart';
import {DimensionsOverviewReportPart} from './accountingreports/reportparts/dimensionsOverviewReportPart';
import {DrilldownBalanceReportPart} from './accountingreports/reportparts/drilldownBalanceReportPart';
import {CreateCorrectedVatReportModal} from './vatreport/modals/createCorrectedVatReport';
import {HistoricVatReportModal} from './vatreport/modals/historicVatReports';
import {VatDeductionGroupSetupModal} from './vatsettings/modals/vatDeductionGroupSetupModal';
import {NewAccountModal} from './NewAccountModal';
import {BillsView} from './bill/bills';
import {BillView} from './bill/detail/bill';
import {BillHistoryView} from './bill/detail/history/history';
import {BillPreviousView} from './bill/detail/previous/previous';
import {UniAssignModal} from './bill/detail/assignmodal';
import {MyStringFilterPipe} from './bill/detail/assignmodal';
import {AccountSettings} from './accountSettings/accountSettings';
import {AccountList} from './accountSettings/accountList/accountList';
import {AccountDetails} from './accountSettings/accountDetails/accountDetails';
import {VatSettings} from './vatsettings/vatsettings';
import {VatTypeDetails} from './vatsettings/vattypedetails/vattypedetails';
import {VatTypeList} from './vatsettings/vattypelist/vatTypeList';
import {VatDeductionSettings} from './vatsettings/vatdeductions/vatdeductionsettings';
import {PostPost} from './postpost/postpost';
import {UniNewSupplierModal} from './supplier/details/newSupplierModal';
import {SupplierDetails} from './supplier/details/supplierDetails';
import {SupplierList} from './supplier/list/supplierList';
import {PeriodFilterHelper} from '@app/components/accounting/accountingreports/periodFilter/periodFilter';
import {SelectDraftLineModal} from './journalentry/journalentries/selectDraftLineModal';
import {ConfirmCreditedJournalEntryWithDate} from './modals/confirmCreditedJournalEntryWithDate';
import {EditSupplierInvoicePayments} from './modals/editSupplierInvoicePayments';
import {FileFromInboxModal} from './modals/file-from-inbox-modal/file-from-inbox-modal';
import {DraftLineDescriptionModal} from './journalentry/components/journalentryprofessional/draftLineDescriptionModal';
import {UniTickerModule} from '../uniticker/uniTickerModule';
import {UniBudgetView} from './budget/budgetview';
import {UniBudgetEntryEditModal} from './budget/budgetEntryEditModal';
import {UniBudgetEditModal} from './budget/budgetEditModal';
import {
    MatTabsModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatMenuModule,
} from '@angular/material';
import { UniCostAllocation } from '@app/components/accounting/cost-allocation/cost-allocation';
import { UniCostAllocationList } from '@app/components/accounting/cost-allocation/cost-allocation-list/cost-allocation-list';
import { UniCostAllocationDetails } from '@app/components/accounting/cost-allocation/cost-allocation-details/cost-allocation-details';
import { UniReinvoiceModal } from '@app/components/accounting/bill/detail/reinvoiceModal';
import { UniCompanyAccountingSettingsModal } from '@app/components/accounting/bill/detail/companyAccountingSettingsModal';

@NgModule({
    imports: [
        MatTabsModule,
        MatSelectModule,
        MatIconModule,
        MatTooltipModule,
        MatProgressBarModule,
        MatMenuModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,

        UniFrameworkModule,

        LayoutModule,
        AppCommonModule,
        WidgetModule,
        AppPipesModule,
        UniTickerModule,
        RouterModule.forChild(accountingRoutes)
    ],
    declarations: [
        UniAccounting,

        AccountSettings,
        AccountList,
        AccountDetails,

        VatSettings,
        VatTypeDetails,
        VatTypeList,
        VatDeductionSettings,
        VatDeductionGroupSetupModal,

        NewAccountModal,
        SelectDraftLineModal,
        DraftLineDescriptionModal,

        SupplierList,
        SupplierDetails,
        UniNewSupplierModal,
        UniBudgetView,
        UniBudgetEntryEditModal,
        UniBudgetEditModal,
        FileFromInboxModal,

        // journalentry
        JournalEntryProfessional,
        JournalEntryManual,
        JournalEntry,
        JournalEntries,
        Payments,
        BillsView,
        BillView,
        BillHistoryView,
        BillPreviousView,
        SelectJournalEntryLineModal,
        ConfirmCreditedJournalEntryWithDate,
        EditSupplierInvoicePayments,
        UniAssignModal, MyStringFilterPipe,
        NumberAsMoneyPipe,

        // vatreport
        CheckListVat,
        VatReportJournalEntry,
        CreateCorrectedVatReportForm,
        ReceiptVat,
        VatSummaryPerPost,
        VatReportView,
        CreateCorrectedVatReportModal,
        HistoricVatReportModal,

        // transquery
        TransqueryDetails,

        // accounting reports
        AccountingReports,
        ResultReport,
        BalanceReport,
        PeriodPicker,
        AccountDetailsReportModal,
        AccountDetailsReport,
        DistributionPeriodReportPart,
        DrilldownResultReportPart,
        DimensionsOverviewReportPart,
        DimensionResultReport,
        DrilldownBalanceReportPart,
        DimensionTypeReport,
        AccountingReportShortcuts,

        // PostPost
        PostPost,

        // Cost Allocation
        UniCostAllocation,
        UniCostAllocationList,
        UniCostAllocationDetails,

        // Reinvoice
        UniReinvoiceModal,
        UniCompanyAccountingSettingsModal
    ],
    entryComponents: [
        HistoricVatReportModal,
        VatDeductionGroupSetupModal,
        CreateCorrectedVatReportForm,
        AccountDetailsReport,
        SelectJournalEntryLineModal,
        ConfirmCreditedJournalEntryWithDate,
        EditSupplierInvoicePayments,
        NewAccountModal,
        UniAssignModal,
        UniNewSupplierModal,
        AccountDetailsReportModal,
        SelectDraftLineModal,
        DraftLineDescriptionModal,
        UniBudgetEntryEditModal,
        UniBudgetEditModal,
        UniCostAllocation,
        UniCostAllocationList,
        UniCostAllocationDetails,
        UniReinvoiceModal,
        UniCompanyAccountingSettingsModal,
        FileFromInboxModal
    ],
    exports: [
        AccountSettings,
        AccountList,
        AccountDetails,
        NewAccountModal,
        VatSettings,
        VatTypeDetails,
        VatTypeList,
        VatDeductionSettings,
        VatDeductionGroupSetupModal,
        SupplierList,
        SupplierDetails,

        // journalentry
        JournalEntryProfessional,
        JournalEntryManual,
        JournalEntry,
        JournalEntries,
        Payments,
        BillsView,
        SelectJournalEntryLineModal,
        DraftLineDescriptionModal,

        // vatreport
        CheckListVat,
        VatReportJournalEntry,
        CreateCorrectedVatReportForm,
        ReceiptVat,
        VatSummaryPerPost,
        VatReportView,
        CreateCorrectedVatReportModal,
        HistoricVatReportModal,

        // transquery
        TransqueryDetails,

        // accounting reports
        AccountingReports,
        ResultReport,
        BalanceReport,
        PeriodPicker,
        AccountDetailsReportModal,
        AccountDetailsReport,
        DistributionPeriodReportPart,
        DrilldownResultReportPart,
        DimensionsOverviewReportPart,
        DimensionResultReport,
        DrilldownBalanceReportPart,

        // PostPost
        PostPost,

        // CostAllocation
        UniCostAllocation,
        UniCostAllocationList,

        // Reinvoice
        UniReinvoiceModal,
        UniCompanyAccountingSettingsModal
    ],
    providers: [
        PeriodFilterHelper,
    ]
})
export class AccountingModule {
}
