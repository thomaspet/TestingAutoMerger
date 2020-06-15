import { BankStatementMatch, BankStatementEntry } from '@uni-entities';
import { IBankAccount } from './bankjournalmodels';

export interface IMatchEntry {
    ID: number;
    Date: Date;
    Amount: number;
    OpenAmount: number;
    Mode?: number;
    Description: string;
    IsBankEntry: boolean;
    Checked: boolean;
    Closed: boolean;
    JournalEntryNumber?: string;
    StageGroupKey?: string;
    Tagged?: boolean;
    TagSum?: number;
    JournalEntryID?: number;
    SubAccountID?: number;
    SubAccountName?: string;
}

export class BankStatmentMatchDto {
    public ID: number;
    public Amount: number;
    public BankStatementEntryID: number;
    public JournalEntryLineID: number;
    public Batch: string;
    public Group: string;
    public StatusCode: number;
    public SubAccountID?: number;
    public SubAccountName?: string;
    public Description?: string;
    public Date?: Date;
}

export class BankUtil {

    static IsoDate(date: Date) {
        const d = date.getDate();
        const m = date.getMonth() + 1;
        const y = date.getFullYear();
        return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
    }

    static IsValidAccount(value: IBankAccount): boolean {
        if (value && value.AccountNumber && value.AccountNumber.length >= 11) {
            return true;
        }
        return false;
    }

    static safeAdd(a: number, b: number): number {
        return parseFloat((a + b).toFixed(2));
    }

    static isCloseToZero(value: number): boolean {
        return (value < 0.005 && value > -0.005);
    }

    static createGuid(): string {
        function S4() {
            // tslint:disable-next-line: no-bitwise
            return ((( 1 + Math.random() ) * 0x10000 ) | 0).toString(16).substring(1);
        }
        return (S4() + S4() + '-' + S4() + '-4' + S4().substr(0, 3) + '-' + S4() + '-' + S4() + S4() + S4()).toLowerCase();
    }

    static isString(x: any): boolean {
        return x !== null && x !== undefined && x.constructor === String;
    }
}

export class StageGroup {
    items: IMatchEntry[] = [];
    balance: number = 0;
    key: string;

    addMatchEnties(list: Array<BankStatmentMatchDto>) {
        let group = '';
        this.items.forEach(x => { x.Tagged = false; x.TagSum = x.OpenAmount; } );
        // Pass 1 - equal items
        this.items.forEach( x => {
            if (x.Tagged) { return; }
            const y = this.findMatch(x, this.items);
            if (y) {
                group = BankUtil.createGuid();
                if (y.IsBankEntry === x.IsBankEntry) {
                    list.push(this.newMatch(x.TagSum, x.IsBankEntry ? x.ID : 0, x.IsBankEntry ? 0 : x.ID, group));
                    list.push(this.newMatch(y.TagSum, y.IsBankEntry ? y.ID : 0, y.IsBankEntry ? 0 : y.ID, group));
                } else {
                    list.push(this.newMatch(x.TagSum, x.IsBankEntry ? x.ID : y.ID, y.IsBankEntry ? x.ID : y.ID, group,
                        x.SubAccountID || y.SubAccountID, x.SubAccountName || y.SubAccountName, x.Date, x.Description));
                }
                x.Tagged = true; y.Tagged = true;
            }
        });
        // Pass 2 - many-to-one
        let m2m = this.items.filter( x => !x.Tagged);
        let nTries = 0; const nOrigCount = m2m.length;
        while (m2m.length > 0) {
            group = BankUtil.createGuid();
            m2m.forEach( x => {
                if (x.Tagged) { return; }
                const y = this.findMatch(x, this.items, false, false);
                if (y) {
                    const matchAmount = this.smallestAmount(x, y);
                    list.push(this.newMatch(matchAmount, x.IsBankEntry ? x.ID : y.ID, y.IsBankEntry ? x.ID : y.ID, group,
                        x.SubAccountID || y.SubAccountID, x.SubAccountName || y.SubAccountName, x.Date, x.Description));
                    x.TagSum -= matchAmount; y.TagSum -= matchAmount;
                    if (BankUtil.isCloseToZero(x.TagSum)) { x.Tagged = true; }
                    if (BankUtil.isCloseToZero(y.TagSum)) { y.Tagged = true; }
                }
            });
            m2m = this.items.filter( x => !x.Tagged);
            if (nTries++ > nOrigCount + 100) {
                console.log('Escape deadlock after ' + (nOrigCount + 100) + ' retries..');
                break;
            }
        }
        // Pass 3 - add the rest as singles
        m2m = this.items.filter( x => !x.Tagged);
        if (m2m.length > 0) {
            m2m.forEach( x => {
                list.push(this.newMatch(x.TagSum, x.IsBankEntry ? x.ID : 0, x.IsBankEntry ? 0 : x.ID, group,
                    x.SubAccountID, x.SubAccountName, x.Date, x.Description));
            });
        }

    }
    smallestAmount(a: IMatchEntry, b: IMatchEntry): number {
        if (a.TagSum >= 0 && b.TagSum >= 0) { return a.TagSum > b.TagSum ? b.TagSum : a.TagSum; }
        if (a.TagSum <= 0 && b.TagSum <= 0) { return a.TagSum > b.TagSum ? a.TagSum : b.TagSum; }
        return Math.abs(a.TagSum) > Math.abs(b.TagSum) ? a.TagSum : b.TagSum;
    }
    newMatch(
        amount: number,
        bankID: number,
        journalID: number,
        group?: any,
        subAccountID: number = null,
        subAccountName: string = '',
        financialDate: Date = null,
        description: string = ''
    ) {
        const mx = new BankStatmentMatchDto();
        if (bankID) { mx.BankStatementEntryID = bankID; }
        if (journalID) { mx.JournalEntryLineID = journalID; }
        if (group) { mx.Group = group; }
        mx.Amount = amount;
        mx.SubAccountID = subAccountID;
        mx.SubAccountName = subAccountName;
        mx.Date = financialDate;
        mx.Description = description;
        return mx;
    }
    findMatch(item: IMatchEntry, list: IMatchEntry[], checkDelta = true, allowSameSide = true): IMatchEntry {
        for (let i = 0; i < list.length; i++) {
            const x = list[i];
            if (x.Tagged) { continue; }
            if ((x.ID === item.ID && x.IsBankEntry === item.IsBankEntry)) { continue; } // Skip self
            let delta = 0;
            if (x.IsBankEntry === item.IsBankEntry) {
                if (!allowSameSide) { continue; }
                delta = x.TagSum + item.TagSum; // Same side?
            } else {
                delta = x.TagSum - item.TagSum; // left vs right
            }
            const deltaOk = BankUtil.isCloseToZero(delta);
            const samePresign = (item.Amount <= 0 && x.Amount <= 0) || (item.Amount >= 0 && x.Amount >= 0);
            if (checkDelta) {
                if (deltaOk) { return x; }
            } else {
                if (samePresign) { return x; }
            }
        }
    }
}
