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
import {SupplierInvoiceService} from './accounting/supplierInvoiceService';
import {SupplierService} from './accounting/supplierService';
import {VatDeductionService} from './accounting/vatDeductionService';
import {VatDeductionGroupService} from './accounting/vatDeductionGroupService';
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
import {BankFileDownloadService} from './accounting/bankFileDownloadService';
import {BudgetService} from './accounting/budgetService';
import {CostAllocationService} from './accounting/costAllocationService';
import { ReInvoicingService } from '@app/services/accounting/ReInvoicingService';
import { CompanyAccountingSettingsService } from '@app/services/accounting/companyAccountingSettingsService';
import { AccountMandatoryDimensionService } from './accounting/accountMandatoryDimensionService';
import { JournalEntryTypeService } from './accounting/journal-entry-type.service';
import {AltinnAccountLinkService} from '@app/services/accounting/altinnAccountLinkService';


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
export * from './accounting/supplierInvoiceService';
export * from './accounting/supplierService';
export * from './accounting/vatDeductionService';
export * from './accounting/vatDeductionGroupService';
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
export * from './accounting/bankFileDownloadService';
export * from './accounting/budgetService';
export * from './accounting/costAllocationService';
export * from './accounting/ReInvoicingService';
export * from './accounting/companyAccountingSettingsService';
export * from './accounting/accountMandatoryDimensionService';
export * from './accounting/journal-entry-type.service';

@NgModule()
export class AccountingServicesModule {
    static forRoot(): ModuleWithProviders<AccountingServicesModule> {
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
                SupplierInvoiceService,
                SupplierService,
                VatDeductionService,
                VatDeductionGroupService,
                VatCodeGroupService,
                VatPostService,
                VatReportService,
                VatTypeService,
                AccountVisibilityGroupService,
                FinancialYearService,
                PaymentCodeService,
                PaymentService,
                PaymentBatchService,
                PostPostService,
                BankFileDownloadService,
                BudgetService,
                CostAllocationService,
                ReInvoicingService,
                CompanyAccountingSettingsService,
                AccountMandatoryDimensionService,
                JournalEntryTypeService,
                AltinnAccountLinkService
            ]
        };
    }
}
