import {NgModule, ModuleWithProviders} from '@angular/core';
import {AccountGroupService} from './accounting/accountGroupService';
import {AccountGroupSetService} from './accounting/accountGroupSetService';
import {AccountService} from './accounting/accountService';
import {BankAccountService} from './accounting/bankAccountService';
import {BankService} from './accounting/bankService';
import {JournalEntryLineDraftService} from './accounting/journalEntryLineDraftService';
import {JournalEntryLineService} from './accounting/journalEntryLineService';
import {JournalEntryService} from './accounting/journalEntryService';
import {PeriodSeriesService} from './accounting/periodSeriesService';
import {PeriodService} from './accounting/periodService';
import {SupplierInvoiceItemService} from './accounting/supplierInvoiceItemService';
import {SupplierInvoiceService} from './accounting/supplierInvoiceService';
import {SupplierService} from './accounting/supplierService';
import {VatDeductionService} from './accounting/vatDeductionService';
import {VatCodeGroupService} from './accounting/vatCodeGroupService';
import {VatPostService} from './accounting/vatPostService';
import {VatReportService} from './accounting/vatReportService';
import {VatTypeService} from './accounting/vatTypeService';
import {AccountVisibilityGroupService} from './accounting/accountVisibilityGroupService';
import {FinancialYearService} from './accounting/financialYearService';
import {PaymentCodeService} from './accounting/paymentCodeService';
import {PaymentService} from './accounting/paymentService';
import {PaymentBatchService} from './accounting/paymentBatchService';
import {PostPostService} from './accounting/postPostService';

export * from './accounting/accountGroupService';
export * from './accounting/accountGroupSetService';
export * from './accounting/accountService';
export * from './accounting/bankAccountService';
export * from './accounting/bankService';
export * from './accounting/journalEntryLineDraftService';
export * from './accounting/journalEntryLineService';
export * from './accounting/journalEntryService';
export * from './accounting/periodSeriesService';
export * from './accounting/periodService';
export * from './accounting/supplierInvoiceItemService';
export * from './accounting/supplierInvoiceService';
export * from './accounting/supplierService';
export * from './accounting/vatDeductionService';
export * from './accounting/vatCodeGroupService';
export * from './accounting/vatPostService';
export * from './accounting/vatReportService';
export * from './accounting/vatTypeService';
export * from './accounting/accountVisibilityGroupService';
export * from './accounting/financialYearService';
export * from './accounting/paymentCodeService';
export * from './accounting/paymentService';
export * from './accounting/paymentBatchService';
export * from './accounting/postPostService';

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
        VatDeductionService,
        VatCodeGroupService,
        VatPostService,
        VatReportService,
        VatTypeService,
        AccountVisibilityGroupService,
        FinancialYearService,
        PaymentCodeService,
        PaymentService,
        PaymentBatchService,
        PostPostService
    ]
})
export class AccountingServicesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: AccountingServicesModule,
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
                VatDeductionService,
                VatCodeGroupService,
                VatPostService,
                VatReportService,
                VatTypeService,
                AccountVisibilityGroupService,
                FinancialYearService,
                PaymentCodeService,
                PaymentService,
                PaymentBatchService,
                PostPostService
            ]
        };
    }
}
