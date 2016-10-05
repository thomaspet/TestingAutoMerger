import {JournalEntry, Account, VatType, Dimensions} from '../../unientities';

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

    SameOrNew: string;
}