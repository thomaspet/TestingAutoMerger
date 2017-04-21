import {
    JournalEntry, Account, VatType, Dimensions, Payment, Accrual, JournalEntryLineDraft, LocalDate,
    CurrencyCode, CustomerInvoice
} from '../../unientities';

export class JournalEntryData {
    SameOrNewDetails: any // TODO: find out what type this actually is;
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

    CustomerInvoiceID: number;
    SupplierInvoiceID: number;
    InvoiceNumber: string;

    CurrencyID: number;
    CurrencyCode: CurrencyCode;
    CurrencyExchangeRate: number;

    DimensionsID: number;
    Dimensions: Dimensions;

    JournalEntryDraftIDs: number[];
    JournalEntryDrafts: JournalEntryLineDraft[];

    FileIDs: number[];

    SameOrNew: string;

    StatusCode: number;

    JournalEntryPaymentData: JournalEntryPaymentData;


    JournalEntryDataAccrual: Accrual;
    JournalEntryDataAccrualID: number;

    CustomerOrderID: number;
}

export class JournalEntryPaymentData {
    PaymentData: Payment;
}

export class JournalEntryExtended extends JournalEntry {
    FileIDs: number[];
    Payments: Payment[];
}
