import {Injectable} from '@angular/core';
import {Account, VatType, Dimensions} from '../../unientities';
import {JournalEntryData} from '../../models/accounting/journalentrydata';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {JournalEntry} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

declare var moment;

@Injectable()
export class JournalEntryService extends BizHttp<JournalEntry> {
    private JOURNALENTRYMODE_LOCALSTORAGE_KEY: string;

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = JournalEntry.RelativeUrl;
        this.entityType = JournalEntry.EntityType;
        this.DefaultOrderBy = null;
    }

    public getJournalEntryMode(): string {
        let mode = localStorage.getItem(this.JOURNALENTRYMODE_LOCALSTORAGE_KEY);

        if (!mode) {
            mode = 'PROFESSIONAL';
        }

        if (mode !== 'SIMPLE' && mode !== 'PROFESSIONAL') {
            mode = 'PROFESSIONAL';
        }

        return mode;
    }

    public setJournalEntryMode(newMode: string) {
        localStorage.setItem(this.JOURNALENTRYMODE_LOCALSTORAGE_KEY, newMode);
    }

    public getLastJournalEntryNumber(): Observable<any> {
        return this.http
            .asGET()
            .usingEmptyDomain()
            .withEndPoint('/api/statistics?model=journalentryline&select=journalentrynumber,journalentrynumbernumeric&orderby=journalentrynumbernumeric%20desc&top=1')
            .send()
            .map(response => response.json());
    }

    public getNextJournalEntryNumber(journalentry: JournalEntryData): Observable<any> {
        return this.http
            .asPOST()
            .withBody(journalentry)
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '?action=nextjournalentrynumber')
            .send()
            .map(response => response.json());
    }

    public getJournalEntryPeriodData(accountID: number): Observable<any> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `?action=get-journal-entry-period-data&accountID=${accountID}`)
            .send()
            .map(response => response.json());
    }

    public postJournalEntryData(journalDataEntries: Array<JournalEntryData>): Observable<any> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(journalDataEntries)
            .withEndPoint(this.relativeURL + '?action=post-journal-entry-data')
            .send()
            .map(response => response.json());
    }

    public saveJournalEntryData(journalDataEntries: Array<JournalEntryData>): Observable<any> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(journalDataEntries)
            .withEndPoint(this.relativeURL + '?action=save-journal-entry-data')
            .send()
            .map(response => response.json());
    }

    public validateJournalEntryData(journalDataEntries: Array<JournalEntryData>): Observable<any> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(journalDataEntries)
            .withEndPoint(this.relativeURL + '?action=validate-journal-entry-data')
            .send()
            .map(response => response.json());
    }

    public getJournalEntryDataBySupplierInvoiceID(supplierInvoiceID: number): Observable<any> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '?action=get-journal-entry-data&supplierInvoiceID=' + supplierInvoiceID)
            .send()
            .map(response => response.json());
    }

    public getJournalEntryDataByJournalEntryID(journalEntryID: number): Observable<any> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '?action=get-journal-entry-data&journalEntryID=' + journalEntryID)
            .send()
            .map(response => response.json());
    }

    public calculateJournalEntrySummary(journalDataEntries: Array<JournalEntryData>): Observable<any> {
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

