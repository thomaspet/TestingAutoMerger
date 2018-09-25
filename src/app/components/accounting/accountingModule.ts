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
import {UniAddFileModal} from './bill/detail/addFileModal';
import {MyStringFilterPipe} from './bill/detail/assignmodal';
import {AccountSettings} from './accountSettings/accountSettings';
import {DimensionList} from './accountSettings/dimensionList/dimensionList';
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
import {DraftLineDescriptionModal} from './journalentry/components/journalentryprofessional/draftLineDescriptionModal';
import {MatTabsModule, MatSelectModule, MatIconModule} from '@angular/material';

@NgModule({
    imports: [
        MatTabsModule,
        MatSelectModule,
        MatIconModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,

        UniFrameworkModule,

        LayoutModule,
        AppCommonModule,
        WidgetModule,
        AppPipesModule,
        RouterModule.forChild(accountingRoutes)
    ],
    declarations: [
        UniAccounting,

        AccountSettings,
        DimensionList,
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
        UniAssignModal, MyStringFilterPipe,
        UniAddFileModal, NumberAsMoneyPipe,

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
        PostPost
    ],
    entryComponents: [
        HistoricVatReportModal,
        VatDeductionGroupSetupModal,
        CreateCorrectedVatReportForm,
        AccountDetailsReport,
        SelectJournalEntryLineModal,
        ConfirmCreditedJournalEntryWithDate,
        NewAccountModal,
        UniAssignModal,
        UniAddFileModal,
        UniNewSupplierModal,
        AccountDetailsReportModal,
        SelectDraftLineModal,
        DraftLineDescriptionModal
    ],
    exports: [
        AccountSettings,
        DimensionList,
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
        PostPost
    ],
    providers: [
        PeriodFilterHelper,
    ]
})
export class AccountingModule {
}
