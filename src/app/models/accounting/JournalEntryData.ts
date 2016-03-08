import {IJournalEntry, IAccount, IVatType, IDimensions} from '../../../framework/interfaces/interfaces';

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
    DebitVatType: IVatType;
    
    CreditAccountID: number; 
    CreditAccountNumber: number;
    CreditAccount: any;
    CreditVatTypeID: number;
    CreditVatType: IVatType;      
    
    Description: string;
    
    FinancialDate: Date;  
    
    CurrencyID: number;
    CurrencyCode: string;
        
    Dimensions: any;
}