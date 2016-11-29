import {NgModule} from '@angular/core';
import {AccountGroupService} from './AccountGroupService';
import {AccountGroupSetService} from './AccountGroupSetService';
import {AccountService} from './AccountService';
import {BankAccountService} from './BankAccountService';
import {BankService} from './BankService';
import {JournalEntryLineDraftService} from './JournalEntryLineDraftService';
import {JournalEntryLineService} from './JournalEntryLineService';
import {JournalEntryService} from './JournalEntryService';
import {PeriodSeriesService} from './PeriodSeriesService';
import {PeriodService} from './PeriodService';
import {SupplierInvoiceItemService} from './SupplierInvoiceItemService';
import {SupplierInvoiceService} from './SupplierInvoiceService';
import {SupplierService} from './SupplierService';
import {VatCodeDeductionService} from './VatCodeDeductionService';
import {VatCodeGroupService} from './VatCodeGroupService';
import {VatPostService} from './VatPostService';
import {VatReportService} from './VatReportService';
import {VatTypeService} from './VatTypeService';
import {AccountVisibilityGroupService} from './AccountVisibilityGroupService';
import {FinancialYearService} from './FinancialYearService';
import {PaymentCodeService} from './PaymentCodeService';
import {PaymentService} from './PaymentService';
import {PaymentBatchService} from './PaymentBatchService';

@NgModule({
    providers: [
        AccountGroupService,
        AccountGroupSetService,
        AccountService,
        BankAccountService,
        BankService,
        JournalEntryLineDraftService,
        JournalEntryLineService,
        JournalEntryService,
        PeriodSeriesService,
        PeriodService,
        SupplierInvoiceItemService,
        SupplierInvoiceService,
        SupplierService,
        VatCodeDeductionService,
        VatCodeGroupService,
        VatPostService,
        VatReportService,
        VatTypeService,
        AccountVisibilityGroupService,
        FinancialYearService,
        PaymentCodeService,
        PaymentService,
        PaymentBatchService
    ]
})
export class AccountingServicesModule {

}
