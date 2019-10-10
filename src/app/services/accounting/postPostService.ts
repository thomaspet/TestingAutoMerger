import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {PostPost, LocalDate, StatusCodeJournalEntryLine, JournalEntryLine} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {Subject} from 'rxjs';

export interface IAutoMarkAllResponseObject {
    message: string;
    percent: any;
    ETRInSeconds?: number;
    finalized: boolean;
    errors: number;
    logMessages?: any[];
    doneMessage?: string;
}

@Injectable()
export class PostPostService extends BizHttp<PostPost> {

    public cancelAutomarkAll: boolean = false;

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = PostPost.RelativeUrl;
        this.entityType = PostPost.EntityType;
        this.DefaultOrderBy = null;
    }

    public ResetJournalEntryLinePostStatus(journalentryLineid: number) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '?action=reset-journalentryline-postpost-status-to-open&journalentrylineid=' + journalentryLineid)
            .send()
            .map(response => response.body);
    }

    public ResetJournalEntryLinesPostStatus(subaccountid: number, reskontroType: string) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '?action=reset-journalentrylines-postpost-status-to-open&subaccountid=' + subaccountid)
            .send()
            .map(response => response.body);
    }

    public markPosts(journalEntryLineCouples: Array<any>): Observable<any> {
        super.invalidateCache();
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(journalEntryLineCouples)
            .withEndPoint(this.relativeURL + '?action=markposts')
            .send()
            .map(response => response.body);
    }

    public revertPostpostMarking(journalEntryLineIDs: Array<number>): Observable<any> {
        super.invalidateCache();
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(journalEntryLineIDs)
            .withEndPoint(this.relativeURL + '?action=revert-postpost')
            .send()
            .map(response => response.body);
    }

    public async automarkAccount(
        items: IEntryLine[],
        customerid?: number,
        supplierid?: number,
        accountid?: number,
        ruleSet: Array<MatchingType> = [MatchingType.MatchAll]
    ): Promise<JournalEntryLineCouple[]> {

            const filter = customerid ? `customerid=${customerid}` : supplierid ? `supplierid=${supplierid}` : `accountid=${accountid}`;
            const route = `?action=get-suggestions&${filter}&methods=${ruleSet.join(',')}`;
            return await this.http
                .asGET().usingBusinessDomain()
                .withEndPoint(this.relativeURL + route).send()
                .map(response => {
                    const result: { Pairs: any[], Entries: any[]} = response.body;
                    if (result && result.Entries) {
                        result.Entries.forEach(element => {
                            const match = items.find( x => x.ID === element.ID);
                            if (match) {
                                match.RestAmount = element.RestAmount;
                                match._originalRestAmount = element.OriginalRestAmount;
                                match._rowSelected = true;
                                match.Markings = element.Markings;
                            }
                        });
                    }
                    return result.Pairs;
                })
                .toPromise();
    }

    public automarkAllAccounts(accountFrom, accountTo, method): Subject<IAutoMarkAllResponseObject> {
        const query = '?model=JournalEntryLine&select=subaccount.accountnumber as AccountNo,' +
        'subaccount.customerid as CustomerID,subaccount.accountName as Name,subaccount.supplierid as SupplierID' +
        ',subaccount.ID as AccountID,sum(amount) as Balance,sum(restamount) as Unmarked,count(id) as ItemCount' +
        ',sum(casewhen(restamount lt 0\,1\,0)) as NumNegative,sum(casewhen(restamount gt 0\,1\,0)) as NumPositive' +
        `&filter=subaccount.accountnumber ge ${accountFrom} and subaccount.accountnumber le ${accountTo} and statuscode le 31002` +
        '&orderby=subaccount.accountnumber&expand=subaccount&wrap=false';


        const responseObject: Subject<IAutoMarkAllResponseObject> = new Subject();
        let errors: number = 0;
        const logMessages: any[] = [];

        responseObject.next({
            message: 'Starter automerking, henter data..',
            percent: 100,
            errors: errors,
            finalized: false
        });

        this.ResetJournalEntryLinesPostStatus(null, 'customer').subscribe((resCust) => {
            this.ResetJournalEntryLinesPostStatus(null, 'supplier').subscribe((resSupp) => {

            this.http
                .asGET()
                .usingStatisticsDomain()
                .withEndPoint(query)
                .send()
                .map(res => res.body)
                .subscribe((result) => {

                    if (!result) {
                        responseObject.next({
                            message: 'Fant ingen kontoer å automerke.',
                            percent: 100,
                            errors: errors,
                            finalized: true
                        });
                        responseObject.complete();
                        return;
                    } else {
                        responseObject.next({
                            message: `Fant ${result.length} kontoer med mulig automerking. Sjekker kontoer nå.`,
                            percent: 0,
                            errors: errors,
                            finalized: false
                        });
                    }

                    const markableResults = result.filter(item => (item.ItemCount > 0 && item.NumNegative !== 0 && item.NumPositive !== 0));

                    const batchSuggestions = (index: number) => {
                        if (index >= markableResults.length) {
                            responseObject.next({
                                message:  `${logMessages.length - errors} kontoer merket, ${errors} feilet.`,
                                percent: 100,
                                errors: errors,
                                finalized: true,
                                logMessages: logMessages
                            });

                            return;
                        } else if (this.cancelAutomarkAll) {
                            responseObject.next({
                                message:  `Automerking avbrutt.. ${logMessages.length - errors} kontoer merket, ${errors} feilet.`,
                                percent: 100,
                                errors: errors,
                                finalized: true,
                                logMessages: logMessages
                            });

                            return false;
                        }

                        const item = markableResults[index];

                        responseObject.next({
                            message: `${item.AccountNo} - ${item.Name}`,
                            errors: errors,
                            percent: Math.floor((index / markableResults.length) * 100),
                            finalized: false
                        });

                        if (item.ItemCount < 0 || item.NumNegative === 0 || item.NumPositive === 0) {
                            // Unmarkable, do nothing
                            batchSuggestions(index + 1);
                        } else {
                            const route = `postposts?action=get-suggestions&methods=${method}&${this.getRouteFilter(item)}`;
                            this.http
                                .asGET()
                                .usingBusinessDomain()
                                .withEndPoint(route)
                                .send()
                                .map(res => res.body)
                                .subscribe((suggestions) => {
                                    // Add new query to the allBatches array
                                    if (suggestions) {
                                        const markings = suggestions.Pairs;
                                        if (markings && markings.length) {
                                            let position = 0;
                                            const batches: any[] = [];
                                            const batchSize: number = 50;

                                            // Add suggested pairs in batches and send them to prevent server timeout
                                            while (position < markings.length) {
                                                const batch = markings.slice(position, position + batchSize);
                                                position += batchSize;
                                                batches.push(
                                                    this.http
                                                        .asPOST()
                                                        .usingBusinessDomain()
                                                        .withEndPoint('postposts?action=markposts')
                                                        .withBody(batch)
                                                        .send()
                                                        .do(() => {
                                                            logMessages.push({
                                                                message: 'Vellykket automerking av ' + (batch.length * 2) +
                                                                ' linjer for ' + item.AccountNo + ' - ' + item.Name,
                                                                error: false
                                                            });
                                                        })
                                                        .catch((err) => {
                                                            errors++;
                                                            const error = err.error;
                                                            let errorMessage = '';
                                                            if (error && error.Messages && error.Messages.length) {
                                                                errorMessage = error.Messages[0].Message;
                                                            } else if (error && error.JournalEntryNumber) {
                                                                errorMessage = 'Feil på bilagsnr. ' + error.JournalEntryNumber;
                                                            }
                                                            logMessages.push({
                                                                message: 'Feil på automerking av konto: '
                                                                + item.AccountNo + ' - ' + item.Name,
                                                                error: true,
                                                                errorMsg: errorMessage
                                                                });
                                                            return Observable.of('');
                                                        })
                                                );
                                            }

                                            Observable.forkJoin(batches).subscribe((batchResult) => {
                                                batchSuggestions(index + 1);
                                            }, (error) => {
                                                batchSuggestions(index + 1);
                                            });

                                        } else {
                                            batchSuggestions(index + 1);
                                        }
                                    } else {
                                        batchSuggestions(index + 1);
                                    }
                                });
                        }
                    };
                    batchSuggestions(0);
                });
            });
        });
        return responseObject;

    }

    private getRouteFilter(item) {
        const string = item.SupplierID > 0 ? 'supplierID' : item.CustomerID > 0 ? 'customerID' : 'accountID';
        return string + '=' + (item.SupplierID > 0 ? item.SupplierID : item.CustomerID > 0 ? item.CustomerID : item.AccountID);
    }
}

// Internal interfaces for simplifying auto-marking

export enum MatchingType {
    MatchKidExact = 1,
    MatchInvoiceExact = 2,
    MatchInvoicePartial = 3,
    MatchEqualSums = 4,
    MatchFifoIfZeroBalance = 5,
    MatchFifo = 6,
    MatchAll = 10
}

interface IEntryLine {
    ID: number;
    StatusCode: StatusCodeJournalEntryLine;
    InvoiceNumber: number;
    JournalEntryNumber: string;
    Amount: number;
    AmountCurrency: number;
    CurrencyCodeCode: string;
    FinancialDate: LocalDate;
    RestAmount: number;
    Markings: Array<{JournalEntryNumber: string}>;
    _originalRestAmount?: number;
    _originalStatusCode?: StatusCodeJournalEntryLine;
    _isDirty?: boolean;
    _rowSelected?: boolean;
}

export class JournalEntryLineCouple {
    public JournalEntryLineId1: number; // tslint:disable-line
    public JournalEntryLineId2: number; // tslint:disable-line
}
