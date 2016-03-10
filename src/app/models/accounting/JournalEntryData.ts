import {JournalEntry, Account, VatType, Dimensions} from '../../unientities';

export class JournalEntryData {        
    JournalEntryID: number;
    JournalEntryLineID: number;
    JournalEntryDraftLineID: number;
    
    JournalEntryNo: number;
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
    
    CurrencyID: number;
    CurrencyCode: string;
        
    Dimensions: any;
    
    JournalEntryDraftIDs: number[];
}