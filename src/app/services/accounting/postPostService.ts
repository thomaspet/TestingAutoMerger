import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {PostPost, LocalDate, StatusCodeJournalEntryLine} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class PostPostService extends BizHttp<PostPost> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = PostPost.RelativeUrl;
        this.entityType = PostPost.EntityType;
        this.DefaultOrderBy = null;
    }

    public markPosts(journalEntryLineCouples: Array<any>): Observable<any> {
        super.invalidateCache();
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(journalEntryLineCouples)
            .withEndPoint(this.relativeURL + '?action=markposts')
            .send()
            .map(response => response.json());
    }

    public revertPostpostMarking(journalEntryLineIDs: Array<number>): Observable<any> {
        super.invalidateCache();
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(journalEntryLineIDs)
            .withEndPoint(this.relativeURL + '?action=revert-postpost')
            .send()
            .map(response => response.json());
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
                    const result: { Pairs: any[], Entries: any[]} = response.json();
                    if (result && result.Entries) {
                        result.Entries.forEach(element => {
                            const match = items.find( x => x.ID === element.ID);
                            if (match) {
                                match.RestAmount = element.RestAmount;
                                match.StatusCode = element.StatusCode;
                            }
                        });
                    }
                    return result.Pairs;
                })
                .toPromise();
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
