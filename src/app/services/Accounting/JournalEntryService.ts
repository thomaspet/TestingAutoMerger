import {Injectable} from '@angular/core';
import {Account, VatType, Dimensions} from '../../unientities';
import {JournalEntryData} from '../../models/accounting/journalentrydata';
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/from";
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {JournalEntry} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

declare var moment;

@Injectable()
export class JournalEntryService extends BizHttp<JournalEntry> {

    constructor(http: UniHttp) {
        super(http);

        //TODO: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.relativeURL = JournalEntry.RelativeUrl;

        this.entityType = JournalEntry.EntityType;

        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }

    getLastJournalEntryNumber(): Observable<any> {
        return this.http
            .asGET()
            .usingEmptyDomain()
            .withEndPoint('/api/statistics?model=journalentryline&select=journalentrynumber,journalentrynumbernumeric&orderby=journalentrynumbernumeric%20desc&top=1')
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

