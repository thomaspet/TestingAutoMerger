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
import {SettingsModule} from '../settings/settingsModule';
import {SupplierInvoiceFileUploader} from './journalentry/supplierinvoices/supplierinvoiceuploader';
import {SalesModule} from '../sales/salesModule';

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
        SalesModule
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

        // vatreport
        CheckListVat,
        VatReportJournalEntry,
        CreateCorrectedVatReportForm,
        HistoricVatReportTable,
        ReceiptVat,
        VatSummaryPerPost,
        VatReportView,

        // transquery
        Transquery,
        TransqueryList,
        TransqueryDetails
    ],
    providers: [
        SupplierInvoiceFileUploader
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

        // vatreport
        CheckListVat,
        VatReportJournalEntry,
        CreateCorrectedVatReportForm,
        HistoricVatReportTable,
        ReceiptVat,
        VatSummaryPerPost,
        VatReportView,

        // transquery
        Transquery,
        TransqueryList,
        TransqueryDetails
    ]
})
export class AccountingModule {}
