import {JournalEntry, Account, VatType, Dimensions, Payment, Accrual} from '../../unientities';

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

    FinancialDate: Date;

    CustomerInvoiceID: number;
    SupplierInvoiceID: number;
    InvoiceNumber: string;

    CurrencyID: number;
    CurrencyCode: string;

    DimensionsID: number;
    Dimensions: Dimensions;

    JournalEntryDraftIDs: number[];

    FileIDs: number[];

    SameOrNew: string;

    StatusCode: number;

    JournalEntryPaymentData: JournalEntryPaymentData;

    JournalEntryDataAccrual: Accrual;
}

export class JournalEntryPaymentData {
    PaymentData: Payment;
}
