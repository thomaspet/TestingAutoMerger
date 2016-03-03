import {BaseApiService} from '../../../framework/core/BaseApiService';
import {IJournalEntry, IAccount, IVatType, IDimensions} from '../../../framework/interfaces/interfaces';
import {UniHttp} from '../../../framework/core/http';
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/fromArray";

export class JournalEntryService extends BaseApiService<IJournalEntry> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        //TODO: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.RelativeURL = 'JournalEntries';
        
        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }       
    
    getAggregatedData() : Observable<any> {
        return Observable.fromArray([[JournalEntryService.getSomeNewDataForMe(), JournalEntryService.getSomeNewDataForMe()]]);
    }
    
    public static getSomeNewDataForMe() : JournalEntryAggregated {
        
        var descriptions = ['Betaling','Avskrivning','Faktura','Lønnsutbetaling']
        
        var data = new JournalEntryAggregated();
        
        data.JournalEntryNo = 1;
        data.Amount = Math.round(Math.random() * 10000);
        data.DebitAccountNumber = 4000;
        data.DebitAccount = {AccountNumber:4000, AccountName: "varekjøp"};
	    data.CreditAccountNumber = 5000;
        data.CreditAccount = {AccountNumber:5000, AccountName: "lønn"};
    
        data.FinancialDate = new Date();
        data.Description = descriptions[Math.floor(Math.random() * 4)];
                
        return data;
    } 
}

export class JournalEntryAggregated {
        
    JournalEntryID: number;
    JournalEntryLineID: number;
    JournalEntryDraftLineID: number;
    
    JournalEntryNo: number;
    
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
    
    Dimensions: IDimensions;
    
    
}