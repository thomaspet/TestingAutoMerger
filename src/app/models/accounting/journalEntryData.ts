import {
    JournalEntry, Account, VatType, Dimensions, Payment, Accrual, JournalEntryLineDraft, JournalEntryLine, LocalDate,
    CurrencyCode, CustomerInvoice, CostAllocation, JournalEntryType, CustomerOrder
} from '../../unientities';

export class JournalEntryData {
    SameOrNewDetails: any // TODO: find out what type this actually is;

    NumberSeriesTaskID: number;
    NumberSeriesID: number;

    JournalEntryID: number;
    JournalEntryLineID: number;
    JournalEntryDraftLineID: number;

    NetAmount: number;
    NetAmountCurrency: number;

    JournalEntryNo: string;
    SupplierInvoiceNo: string;

    Amount: number;
    AmountCurrency: number;

    DebitAccountID: number;
    DebitAccountNumber: number;
    DebitAccount: any;
    DebitVatTypeID: number;
    DebitVatType: VatType;

    CreditAccountID: number;
    CreditAccountNumber: number;
    CreditAccount: any;
    CreditVatTypeID: number;
    CreditVatType: VatType;

    CustomerInvoice: CustomerInvoice;

    VatDeductionPercent: number;

    Description: string;

    FinancialDate: LocalDate;
    VatDate: LocalDate;
    PaymentID: string;

    CustomerInvoiceID: number;
    SupplierInvoiceID: number;
    InvoiceNumber: string;
    DueDate: LocalDate;

    CurrencyID: number;
    CurrencyCode: CurrencyCode;
    CurrencyExchangeRate: number;

    MandatoryDimensionsValidation: any;

    DimensionsID: number;
    Dimensions: Dimensions;

    CustomerOrder: CustomerOrder;

    JournalEntryDraftIDs: number[];
    JournalEntryDrafts: JournalEntryLineDraft[];

    FileIDs: number[];

    SameOrNew: string;

    StatusCode: number;

    JournalEntryPaymentData: JournalEntryPaymentData;

    JournalEntryType: JournalEntryType;
    JournalEntryTypeID: number;

    JournalEntryDataAccrual: Accrual;
    JournalEntryDataAccrualID: number;

    CustomerOrderID: number;

    PostPostJournalEntryLineID: number;
    PostPostJournalEntryLine: JournalEntryLine;

    CostAllocation: CostAllocation
}

export enum NumberSeriesTaskIds {
    Journal = 1,
    CustomerInvoice = 2,
    SupplierInvoice = 3,
    Salary = 4,
    Bank = 5,
    VatReport = 6,
    Asset = 7
}

export class JournalEntryPaymentData {
    PaymentData: Payment;
}

export class JournalEntryExtended extends JournalEntry {
    FileIDs: number[];
    Payments: Payment[];
}

export class FieldAndJournalEntryData {
    Field: string;
    JournalEntryData: JournalEntryData;
}

export class AccountingCostSuggestion {
    konto: string;
    avd: string;
    prod: string;
    prosj: string;
    mvakode: string;
    
    Amount: number;
    AmountCurrency: number;
    Description: string;
    FinancialDate: LocalDate
}
