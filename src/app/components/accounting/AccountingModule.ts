// Angular imports
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';

// App imports
import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {UniTableModule} from 'unitable-ng2/main';
import {AppCommonModule} from '../common/appCommonModule';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {AppServicesModule} from '../../services/servicesModule';

// routes
import {routes as AccountingRoutes} from './accountingRoutes';

// specific imports
import {UniAccounting} from './accounting';
import {JournalEntryProfessional} from './journalentry/components/journalentryprofessional/journalentryprofessional';
import {JournalEntrySimple} from './journalentry/components/journalentrysimple/journalentrysimple';
import {JournalEntrySimpleForm} from './journalentry/components/journalentrysimple/journalentrysimpleform';
import {JournalEntryManual} from './journalentry/journalentrymanual/journalentrymanual';
import {CheckListVat} from './vatreport/checkList/checkList';
import {VatReportJournalEntry} from './vatreport/JournalEntry/vatReportJournalEntry';
import {CreateCorrectedVatReportForm} from './vatreport/modals/createCorrectedVatReport';
import {HistoricVatReportTable} from './vatreport/modals/historicVatReports';
import {ReceiptVat} from './vatreport/receipt/receipt';
import {VatSummaryPerPost} from './vatreport/reportSummary/reportSummary';
import {TransqueryList} from './transquery/list/transqueryList';
import {TransqueryDetails} from './transquery/details/transqueryDetails';
import {Transquery} from './transquery/transquery';
import {JournalEntries} from './journalentry/journalentries/journalentries';
import {Payments} from './journalentry/payments/payments';
import {SupplierInvoiceList} from './journalentry/supplierinvoices/supplierinvoicelist';
import {SupplierInvoiceDetail} from './journalentry/supplierinvoices/supplierinvoicedetail';
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
import {DistributionPeriodReportPart} from './accountingreports/reportparts/distributionPeriodReportPart';
import {DimensionsOverviewReportPart}  from './accountingreports/reportparts/dimensionsOverviewReportPart';
import {DrilldownBalanceReportPart}  from './accountingreports/reportparts/drilldownBalanceReportPart';
import {SettingsModule} from '../settings/settingsModule';
import {CreateCorrectedVatReportModal} from './vatreport/modals/createCorrectedVatReport';
import {HistoricVatReportModal} from './vatreport/modals/historicVatReports';
import {SalesModule} from '../sales/salesModule';
import {BillsView} from './bill/bills';
import {BillView} from './bill/detail/bill';
import {BillSimpleJournalEntryView, AccountPipe, VatCodePipe, TrimTextPipe} from './bill/detail/journal/simple';
import {TimetrackingModule} from '../timetracking/timetrackingmodule';

@NgModule({
    imports: [
        // Angular modules
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,

        // UniTable
        UniTableModule,

        // Framework
        UniFrameworkModule,

        // App Modules
        LayoutModule,
        AppCommonModule,
        AppPipesModule,
        AppServicesModule,
        SettingsModule,

        // Route module
        AccountingRoutes,
        SalesModule,
        TimetrackingModule        
    ],
    declarations: [
        UniAccounting,

        // journalentry
        JournalEntryProfessional,
        JournalEntrySimple,
        JournalEntrySimpleForm,
        JournalEntryManual,
        JournalEntry,
        JournalEntries,
        Payments,
        SupplierInvoiceList,
        SupplierInvoiceDetail,
        BillsView,
        BillView,
        BillSimpleJournalEntryView,
        AccountPipe, VatCodePipe, TrimTextPipe,

        // vatreport
        CheckListVat,
        VatReportJournalEntry,
        CreateCorrectedVatReportForm,
        HistoricVatReportTable,
        ReceiptVat,
        VatSummaryPerPost,
        VatReportView,
        CreateCorrectedVatReportModal,
        HistoricVatReportModal,

        // transquery
        Transquery,
        TransqueryList,
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
        DrilldownBalanceReportPart
    ],
    entryComponents: [
        HistoricVatReportTable,
        CreateCorrectedVatReportForm,
        AccountDetailsReport
    ],
    providers: [
    ],
    exports: [
        // journalentry
        JournalEntryProfessional,
        JournalEntrySimple,
        JournalEntrySimpleForm,
        JournalEntryManual,
        JournalEntry,
        JournalEntries,
        Payments,
        SupplierInvoiceList,
        SupplierInvoiceDetail,
        BillsView,

        // vatreport
        CheckListVat,
        VatReportJournalEntry,
        CreateCorrectedVatReportForm,
        HistoricVatReportTable,
        ReceiptVat,
        VatSummaryPerPost,
        VatReportView,
        CreateCorrectedVatReportModal,
        HistoricVatReportModal,

        // transquery
        Transquery,
        TransqueryList,
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
        DrilldownBalanceReportPart
    ]
})
export class AccountingModule {
}
