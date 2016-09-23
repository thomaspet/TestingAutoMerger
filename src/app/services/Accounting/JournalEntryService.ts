import {Account, VatType, Dimensions} from '../../unientities';
import {JournalEntryData} from '../../models/accounting/journalentrydata';
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/from";
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {JournalEntry} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

declare var moment;

export class JournalEntryService extends BizHttp<JournalEntry> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        //TODO: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.relativeURL = JournalEntry.RelativeUrl;
        
        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }

    getLastJournalEntryNumber(): Observable<any> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('statistics?model=journalentryline&select=journalentrynumber&orderby=journalentrynumber%20desc&top=1')
            .send()
            .map(response => response.json());
    }       
    
    getNextJournalEntryNumber(journalentry: JournalEntryData): Observable<any> {
        return this.http
            .asPOST()
            .withBody(journalentry)
            .usingBusinessDomain()             
            .withEndPoint(this.relativeURL + '?action=nextjournalentrynumber')
            .send()
            .map(response => response.json());
    }

    getJournalEntryPeriodData(accountID: number): Observable<any> {
        return this.http
            .asGET()
            .usingBusinessDomain()             
            .withEndPoint(this.relativeURL + `?action=get-journal-entry-period-data&accountID=${accountID}`)
            .send()
            .map(response => response.json());
    }
    
    postJournalEntryData(journalDataEntries: Array<JournalEntryData>): Observable<any> {        
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(journalDataEntries)
            .withEndPoint(this.relativeURL + '?action=post-journal-entry-data')
            .send()
            .map(response => response.json());
    }  
    
    saveJournalEntryData(journalDataEntries: Array<JournalEntryData>): Observable<any> {        
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(journalDataEntries)
            .withEndPoint(this.relativeURL + '?action=save-journal-entry-data')
            .send()
            .map(response => response.json());
    }  
    
    validateJournalEntryData(journalDataEntries: Array<JournalEntryData>): Observable<any> {        
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(journalDataEntries)
            .withEndPoint(this.relativeURL + '?action=validate-journal-entry-data')
            .send()
            .map(response => response.json());
    }    
    
    getJournalEntryDataBySupplierInvoiceID(supplierInvoiceID: number): Observable<any> {
        return this.http
            .asGET()
            .usingBusinessDomain()             
            .withEndPoint(this.relativeURL + '?action=get-journal-entry-data&supplierInvoiceID=' + supplierInvoiceID)
            .send()
            .map(response => response.json());
    }

    getJournalEntryDataByJournalEntryID(journalEntryID: number): Observable<any> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '?action=get-journal-entry-data&journalEntryID=' + journalEntryID)
            .send()
            .map(response => response.json());
    }
    
    calculateJournalEntrySummary(journalDataEntries: Array<JournalEntryData>): Observable<any> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(journalDataEntries)
            .withEndPoint(this.relativeURL + '?action=calculate-journal-entry-summary')
            .send()
            .map(response => response.json());
    }       
    
    getAggregatedData() : Observable<any> {
        return Observable.from([[JournalEntryService.getSomeNewDataForMe(), JournalEntryService.getSomeNewDataForMe(), JournalEntryService.getSomeNewDataForMe()]]);
    }
    
    public static getSomeNewDataForMe() : JournalEntryData {
        
        var descriptions = ['Betaling','Avskrivning','Faktura','Lønnsutbetaling']
        var projects = [1, 2, 3, 4];
        var departments = [1, 2, 3, 4];
        
        var data = new JournalEntryData();
        
        data.JournalEntryNo = "1-2016";
        data.Amount = Math.round(Math.random() * 10000);
        data.DebitAccountNumber = 4000;
        data.DebitAccount = {ID: 297, AccountNumber:4000, AccountName: "Varekjøp, høy sats"};
	    data.CreditAccountNumber = 1920 ;
        data.CreditAccount = {ID: 169, AccountNumber:1920 , AccountName: "Bankinnskudd"};
        data.DebitAccountID = 297;
        data.CreditAccountID = 169;
    
        data.FinancialDate = new Date(2016, Math.floor(Math.random() * 12), Math.floor(Math.random() * 29));
        data.Description = descriptions[Math.floor(Math.random() * 4)];
        
        data.Dimensions = {ProjectID: projects[Math.floor(Math.random() * 4)], DepartementID: departments[Math.floor(Math.random() * 4)]};
        data.SupplierInvoiceNo = ((Math.floor(Math.random() * 10) * 10000) + Math.floor(Math.random() * 10000)).toString();
        
        data.JournalEntryDraftIDs = [];
                
        return data;
    } 

    public findJournalNumbersFromLines(journalEntryLines: Array<JournalEntryData>, nextJournalNumber: string = "") {
        var first, last, year;

        if (journalEntryLines && journalEntryLines.length) {
            journalEntryLines.forEach((l: JournalEntryData, i) => {
                if (l.JournalEntryNo) {
                    var parts = l.JournalEntryNo.split('-');
                    var no = parseInt(parts[0]);
                    if (!first || no < first) {
                        first = no;
                    }
                    if (!last || no > last) {
                        last = no;
                    }
                    if (i == 0) {
                        year = parseInt(parts[1]);
                    }                    
                }
            });
            
            if (!first) {
                return null;
            }
        } else if(nextJournalNumber && nextJournalNumber.length) {
            var parts = nextJournalNumber.split('-');
            first = parseInt(parts[0]);
            last = first;
            year = parseInt(parts[1]);
        }
           
        return {
            first: first,
            last: last,
            year: year,
            firstNumber: `${first}-${year}`,
            nextNumber: `${last + (journalEntryLines.length ? 1 : 0)}-${year}`,
            lastNumber: `${last}-${year}`
        };
    }
}

