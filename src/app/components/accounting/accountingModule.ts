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
import {TransqueryDetails} from './transquery/details/transqueryDetails';
import {Transquery} from './transquery/transquery';
import {JournalEntries} from './journalentry/journalentries/journalentries';
import {Payments} from './journalentry/payments/payments';
import {VatReportView} from './vatreport/vatreportview';
import {JournalEntry} from './journalentry/journalentry';
import {ResultReport} from './accountingreports/resultreport/resultreport';
import {DimensionResultReport} from './accountingreports/dimensionreport/dimensionresultreport';
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
import {NewAccountModal} from './NewAccountModal';
import {BillsView} from './bill/bills';
import {BillView} from './bill/detail/bill';
import {BillSimpleJournalEntryView, AccountPipe, VatCodePipe, TrimTextPipe} from './bill/detail/journal/simple';
import {BillHistoryView} from './bill/detail/history/history';
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

@NgModule({
    imports: [
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

        NewAccountModal,
        SelectDraftLineModal,

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
        BillSimpleJournalEntryView, BillHistoryView,
        AccountPipe, VatCodePipe, TrimTextPipe,
        SelectJournalEntryLineModal,
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
        Transquery,
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

        // PostPos
        PostPost
    ],
    entryComponents: [
        HistoricVatReportModal,
        CreateCorrectedVatReportForm,
        AccountDetailsReport,
        SelectJournalEntryLineModal,
        NewAccountModal,
        UniAssignModal,
        UniAddFileModal,
        UniNewSupplierModal,
        AccountDetailsReportModal,
        SelectDraftLineModal
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
        Transquery,
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
