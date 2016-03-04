import {BaseApiService} from '../../../framework/core/BaseApiService';
import {IJournalEntry, IAccount, IVatType, IDimensions} from '../../../framework/interfaces/interfaces';
import {JournalEntryData} from '../../models/accounting/journalentrydata';
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
        return Observable.fromArray([[JournalEntryService.getSomeNewDataForMe(), JournalEntryService.getSomeNewDataForMe(), JournalEntryService.getSomeNewDataForMe()]]);
    }
    
    public static getSomeNewDataForMe() : JournalEntryData {
        
        var descriptions = ['Betaling','Avskrivning','Faktura','Lønnsutbetaling']
        
        var data = new JournalEntryData();
        
        data.JournalEntryNo = 1;
        data.Amount = Math.round(Math.random() * 10000);
        data.DebitAccountNumber = 4000;
        data.DebitAccount = {AccountNumber:4000, AccountName: "varekjøp"};
	    data.CreditAccountNumber = 5000;
        data.CreditAccount = {AccountNumber:5000, AccountName: "lønn"};
    
        data.FinancialDate = new Date(2016, Math.floor(Math.random() * 12), Math.floor(Math.random() * 29));
        data.Description = descriptions[Math.floor(Math.random() * 4)];
                
        return data;
    } 
}

