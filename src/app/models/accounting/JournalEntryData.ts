import {JournalEntry, Account, VatType, Dimensions, Payment, Accrual, JournalEntryLineDraft, LocalDate} from '../../unientities';

export class JournalEntryData {
    JournalEntryID: number;
    JournalEntryLineID: number;
    JournalEntryDraftLineID: number;

    JournalEntryNo: string;
    SupplierInvoiceNo: string;

    Amount: number;

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

    VatDeductionPercent: number;

    Description: string;

    FinancialDate: LocalDate;

    CustomerInvoiceID: number;
    SupplierInvoiceID: number;
    InvoiceNumber: string;

    CurrencyID: number;
    CurrencyCode: string;

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
