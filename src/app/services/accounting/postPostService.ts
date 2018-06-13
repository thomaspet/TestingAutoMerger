import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {PostPost, JournalEntryLine, LocalDate, StatusCodeJournalEntryLine} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {from} from 'rxjs/observable/from';

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

    // automark:
    //   Tries to auto-mark the list of items, and returns a list of suggestions
    //   Note! Does not call any server-side methods and only works on local-data.
    public automark(items: IEntryLine[], ruleSet: Array<MatchingType> = [MatchingType.MatchCombineAll])
        : Observable<JournalEntryLineCouple[]> {
        return from(new Promise( (resolve, reject) => {

            const batch: Batch = new Batch();
            const sortedList = items.sort( (x,y) => x.FinancialDate > y.FinancialDate ? 1 : x.FinancialDate === y.FinancialDate ? 0 : -1);
            const sumBalance = this.sumRemainder(sortedList);

            if (ruleSet.indexOf(MatchingType.MatchInvoiceExact) >= 0 || ruleSet.indexOf(MatchingType.MatchCombineAll) >= 0) {
                this.automark_MatchingInvoices(sortedList, batch, true);
            }

            if (ruleSet.indexOf(MatchingType.MatchInvoicePartial) >= 0 || ruleSet.indexOf(MatchingType.MatchCombineAll) >= 0) {
                this.automark_MatchingInvoices(sortedList, batch, false);
            }

            if (ruleSet.indexOf(MatchingType.MatchSums) >= 0 || ruleSet.indexOf(MatchingType.MatchCombineAll) >= 0) {
                this.automark_MatchingBalance(sortedList, batch);
            }

            // fifo?
            const closeToZero = (sumBalance > -0.5 && sumBalance < -0.5);
            if (closeToZero &&
                ruleSet.indexOf(MatchingType.MatchFifo) >= 0 || ruleSet.indexOf(MatchingType.MatchCombineAll) >= 0) {
                this.automark_MatchingBalance(sortedList, batch, false);
            }

            resolve(batch.pairs);

        }));
    }

    private sumRemainder(list: IEntryLine[]): number {
        var sum = 0;
        list.forEach( x => sum += x.RestAmount);
        return sum;
    }

    private automark_MatchingInvoices(list: IEntryLine[], batch: Batch, exactMatch = true) {
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            if ((!isMarked(item)) && item.InvoiceNumber && item.RestAmount !== 0) {
                for (let ii = 0; ii < list.length; ii++) {
                    const candidate = list[ii];
                    if (candidate.InvoiceNumber === item.InvoiceNumber) {
                        if (compatible(item, candidate, exactMatch)) {
                            batch.markItems(item, candidate);
                        }
                    }
                }
            }
        }
    }

    private automark_MatchingBalance(list: IEntryLine[], batch: Batch, exact = true) {
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            if ((!isMarked(item)) && item.RestAmount !== 0) {
                for (let ii = 0; ii < list.length; ii++) {
                    if (compatible(item, list[ii], exact)) {
                        batch.markItems(item, list[ii]);
                    }
                }
            }
        }
    }



}

// Internal interfaces for simplifying auto-marking

export enum MatchingType {
    MatchInvoiceExact = 1,
    MatchInvoicePartial = 2,
    MatchSums = 3,
    MatchFifo = 4,
    MatchCombineAll = 10
}

export class Batch {
    public groups: Array<Group> = [];
    public pairs: Array<JournalEntryLineCouple> = [];

    public markItems(item1: IEntryLine, item2: IEntryLine) {
        this.addPair(item1, item2);
        for (var i=0; i<this.groups.length; i++) {
            if (this.groups[i].tryMark(item1, item2)) {
                return;
            }
        }
        this.groups.push(new Group(item1, item2, 'Group' + (this.groups.length + 1)));
    }

    private addPair(item1: IEntryLine, item2: IEntryLine) {
        this.pairs.push({
            JournalEntryLineId1: item1.ID,
            JournalEntryLineId2: item2.ID
        });
    }
}

export class Group {
    public items: Array<IEntryLine> = [];
    public keys: number[] = [];
    public balance: number = 0;

    constructor(item1: IEntryLine, item2: IEntryLine, public name = "") {
        this.markItems(item1, item2);
    }

    public tryMark(item1: IEntryLine, item2: IEntryLine): boolean {
        if (this.items.length > 0 && this.balance === 0) { return false; }
        if (this.keys.indexOf(item1.ID)) {
            this.markItems(item1, item2);
            return true;
        }
        if (this.keys.indexOf(item2.ID)) {
            this.markItems(item2, item1);
            return true;
        }
        return false;
    }

    private markItems(item1: IEntryLine, item2: IEntryLine) {
        this.backup(item1);
        this.backup(item2);
        this.attach(item1, item2);
        const tempValue = item1.RestAmount;
        item1.RestAmount += absMin(item2.RestAmount, -tempValue);
        item2.RestAmount += absMin(tempValue, -item2.RestAmount);
        this.addKey(item1);
        this.addKey(item2);
        this.balance = absMax(item1.RestAmount, item2.RestAmount);
        // console.log(`${this.name}: ${item1.ID}: ${item1.RestAmount}, ${item2.ID}: ${item2.RestAmount}, [${this.keys.join(',')}] groupBalance = ${this.balance}`);
    }

    private setStatus(item: IEntryLine) {
        item.StatusCode = item.RestAmount === 0 ? StatusCodeJournalEntryLine.Marked
            : StatusCodeJournalEntryLine.PartlyMarked;
    }

    private backup(item: IEntryLine) {
        item._originalRestAmount = validNum(item._originalRestAmount, item.RestAmount);
        item._originalStatusCode = validNum(item._originalStatusCode, item.StatusCode);
    }


    private addKey(item: IEntryLine) {
        this.setStatus(item);
        if (this.keys.indexOf(item.ID)<0) {
            this.items.push(item);
            this.keys.push(item.ID);
        }
    }

    private attach(item1: IEntryLine, item2: IEntryLine) {
        const ref2 = { JournalEntryNumber: item2.JournalEntryNumber};
        const ref1 = { JournalEntryNumber: item1.JournalEntryNumber}
        item1.Markings = item1.Markings || [];
        item2.Markings = item2.Markings || [];
        item1.Markings.push(ref2);
        item2.Markings.push(ref1);
    }
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

// Helper functions:

function isMarked(line: IEntryLine): boolean {
    if (line.RestAmount === 0) { return true; }
    return line.StatusCode === StatusCodeJournalEntryLine.Marked || line.StatusCode === StatusCodeJournalEntryLine.Credited;
}

function compatible(item1: IEntryLine, item2: IEntryLine, exactMatch = false): boolean {
    const r1 = item1.RestAmount;
    const r2 = item2.RestAmount;
    if (item1.ID === item2.ID) { return false; }
    if (r1 === 0 || r2 === 0) { return false; }
    if (exactMatch) {
        return r1 === -r2;
    }
    return r1 > 0 ? r2 < 0 : (r1 < 0 ? r2 > 0 : false);
}

function absMin(v1: number, v2: number): number {
    return Math.abs(v1) > Math.abs(v2) ? v2 : v1;
}

function absMax(v1: number, v2: number): number {
    return Math.abs(v1) < Math.abs(v2) ? v2 : v1;
}

function validNum(v1?: number, v2?: number): number {
    return v1 === undefined ? (v2 === undefined ? 0 : v2) : v1;
}