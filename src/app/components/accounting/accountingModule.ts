import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {LibraryImportsModule} from '@app/library-imports.module';
import {DateAdapter} from '@angular/material/core';

import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';

import {accountingRoutes} from './accountingRoutes';

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
import {DistributionPeriodReportPart, NumberAsMoneyPipe} from './accountingreports/reportparts/distributionPeriodReportPart';
import {DimensionsOverviewReportPart} from './accountingreports/reportparts/dimensionsOverviewReportPart';
import {DrilldownBalanceReportPart} from './accountingreports/reportparts/drilldownBalanceReportPart';
import {CreateCorrectedVatReportModal} from './vatreport/modals/createCorrectedVatReport';
import {HistoricVatReportModal} from './vatreport/modals/historicVatReports';
import {NewAccountModal} from './NewAccountModal';
import {BillsView} from './bill/bills';
import {BillView} from './bill/detail/bill';
import {BillHistoryView} from './bill/detail/history/history';
import {BillPreviousView} from './bill/detail/previous/previous';
import {BillTransitionModal} from './bill/bill-transition-modal/bill-transition-modal';
import {ReInvoiceInfoModal} from './bill/reinvoice-info-modal/reinvoice-info-modal';
import {BillAssignmentModal} from './bill/assignment-modal/assignment-modal';
import {BillInitModal} from './bill/bill-init-modal/bill-init-modal';
import {Expense, ExpensePrepaid, ExpenseEntries, ExpensePayable, ExpenseSummaryModal} from './bill/expense/expense';
import {RecieverModal} from './bill/expense/reciever-modal/reciever-modal';
import {UniSmartBookingSettingsModal} from './bill/detail/smartBookingSettingsModal';
import {AccountSettings} from './accountSettings/accountSettings';
import {AccountList} from './accountSettings/accountList/accountList';
import {AccountDetails} from './accountSettings/accountDetails/accountDetails';
import {PostPost} from './postpost/postpost';
import {SupplierDetails} from './supplier/details/supplierDetails';
import {SupplierList} from './supplier/list/supplierList';
import {PeriodFilterHelper} from '@app/components/accounting/accountingreports/periodFilter/periodFilter';
import {SelectDraftLineModal} from './journalentry/journalentries/selectDraftLineModal';
import {EditSupplierInvoicePayments} from './modals/editSupplierInvoicePayments';
import {DraftLineDescriptionModal} from './journalentry/components/journalentryprofessional/draftLineDescriptionModal';
import {UniTickerModule} from '../uniticker/uniTickerModule';
import {UniBudgetView} from './budget/budgetview';
import {UniBudgetEntryEditModal} from './budget/budgetEntryEditModal';
import {UniBudgetEditModal} from './budget/budgetEditModal';
import { UniJournalEntryLineModal } from '@uni-framework/uni-modal/modals/JournalEntryLineModal';
import {UniCostAllocation} from '@app/components/accounting/cost-allocation/cost-allocation';
import {UniCostAllocationList} from '@app/components/accounting/cost-allocation/cost-allocation-list/cost-allocation-list';
import {UniCostAllocationDetails} from '@app/components/accounting/cost-allocation/cost-allocation-details/cost-allocation-details';
import {UniInbox} from './inbox/inbox';
import {NewOutgoingWizardModal} from './inbox/new-outgoing-wizard-modal';
import { UniDateAdapter } from '@app/date-adapter';
import {DoneRedirectModal} from './bill/expense/done-redirect-modal/done-redirect-modal';
import {SupplierInvoiceModule} from './supplier-invoice/supplier-invoice.module';
import {NewSupplierInvoiceList} from './supplier-invoice/supplier-invoice-list/supplier-invoice-list';
import {SRSupplierInvoiceList} from './supplier-invoice/list/list';
import {BalanceSearch} from './balance/balanceSearch';

@NgModule({
    imports: [
        LibraryImportsModule,
        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
        UniTickerModule,
        SupplierInvoiceModule,
        RouterModule.forChild(accountingRoutes)
    ],
    declarations: [
        UniAccounting,

        AccountSettings,
        AccountList,
        AccountDetails,

        NewAccountModal,
        SelectDraftLineModal,
        DraftLineDescriptionModal,

        SupplierList,
        NewSupplierInvoiceList,
        SupplierDetails,
        UniBudgetView,
        UniBudgetEntryEditModal,
        UniBudgetEditModal,
        UniInbox,
        NewOutgoingWizardModal,
        DoneRedirectModal,
        SRSupplierInvoiceList,

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
        BillTransitionModal,
        ReInvoiceInfoModal,
        BillAssignmentModal,
        BillInitModal,
        Expense,
        ExpensePrepaid,
        ExpenseEntries,
        ExpensePayable,
        ExpenseSummaryModal,
        RecieverModal,
        SelectJournalEntryLineModal,
        EditSupplierInvoicePayments,
        NumberAsMoneyPipe,
        UniSmartBookingSettingsModal,
        NumberAsMoneyPipe,
        UniJournalEntryLineModal,

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
        BalanceSearch,

        // PostPost
        PostPost,

        // Cost Allocation
        UniCostAllocation,
        UniCostAllocationList,
        UniCostAllocationDetails,
    ],
    providers: [
        { provide: DateAdapter, useClass: UniDateAdapter },
        PeriodFilterHelper,
    ]
})
export class AccountingModule {
}
