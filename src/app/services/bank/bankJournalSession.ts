import { Injectable } from '@angular/core';
import { StatisticsService } from '../common/statisticsService';
import { forkJoin } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { BankUtil } from './bankStatmentModels';
import { safeDec, toIso } from '@app/components/common/utils/utils';

export class DebitCreditEntry {
    public FinancialDate: Date;

    public Debet: IAccount;
    public DebetVatTypeID?: number;
    public DebetAccountID: number;

    public Credit: IAccount;
    public CreditVatTypeID?: number;
    public CreditAccountID: number;

    public Description: string;
    public VatType?: IVatType;

    public Department?: any;
    public Project?: any;

    public Amount: number;
    public InvoiceNumber: string;
    public active = false;
}

export interface IAccount {
    ID: number;
    AccountNumber: number;
    AccountName: string;
    VatTypeID: number;
    superLabel?: string;
}

export interface IVatType {
    ID: number;
    VatCode: string;
    VatPercent: number;
    Name: string;
    OutputVat: boolean;
    superLabel?: string;
}

@Injectable()
export class BankJournalSession {

    public items: DebitCreditEntry[] = [];
    public accounts: Array<IAccount> = [];
    public vatTypes: Array<IVatType> = [];
    public busy = false;
    public balance = 0;

    constructor(private statisticsService: StatisticsService) { }

    clear() {
        this.items = [];
        this.busy = false;
    }

    save(asDraft = false) {
        this.busy = true;
        const cargo = this.convertToJournal();
        const route = asDraft ? 'journalentries?action=book-journal-entries-as-draft' : 'journalentries?action=book-journal-entries';
        return this.HttpPost(route, cargo).finally( () => this.busy = false );
    }

    recalc() {
        this.balance = this.calcTotal();
    }

    initialize() {
        this.clear();
        this.busy = true;
        const accountLoader = this.statisticsService.GetAllUnwrapped('model=account&select=id as ID,accountnumber as AccountNumber'
        + ',accountname as AccountName,vattypeid as VatTypeID'
        + '&filter=accountnumber le 9999 and visible eq 1&orderby=accountnumber');
        const vatLoader = this.HttpGet(`vattypes`);
        return forkJoin(
            accountLoader,
            vatLoader
        ).pipe(
            tap(res => {
                this.accounts = this.createAccountSuperLabel(res[0]);
                this.vatTypes = this.createVatSuperLabel(res[1]);
            }),
            finalize (() => this.busy = false)
        );
    }

    public convertToJournal() {
        let balance = 0;
        const list = [];
        let entry = this.newJournal(); // todo: lookup correct series-id
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (item.Amount) {
                if (item.Debet) {
                    const debet = this.convertToJournalEntry(item);
                    debet.AccountID = item.Debet.ID;
                    entry.DraftLines.push(debet);
                    balance = BankUtil.safeAdd(balance, debet.Amount);
                }
                if (item.Credit) {
                    const credit = this.convertToJournalEntry(item);
                    credit.AccountID = item.Credit.ID;
                    credit.Amount = -item.Amount;
                    entry.DraftLines.push(credit);
                    balance = BankUtil.safeAdd(balance, credit.Amount);
                }
                if (BankUtil.isCloseToZero(balance)) {
                    list.push(entry);
                    entry = this.newJournal();
                }
            }
        }
        if (entry.DraftLines.length > 0) {
            list.push(entry);
        }
        return list;
    }

    private newJournal(draftLines = [], seriesTaskID = 1): { DraftLines: Array<any>, NumberSeriesTaskID: number } {
        return { DraftLines: draftLines, NumberSeriesTaskID: seriesTaskID };
    }

    private convertToJournalEntry(item: DebitCreditEntry) {
        const safeDate = toIso(item.FinancialDate);
        let dimensions: { DepartmentID?: number, ProjectID?: number };
        if (item.Department && item.Department.ID) {
            dimensions = dimensions || { DepartmentID: 0 };
            dimensions.DepartmentID = item.Department.ID;
        }
        if (item.Project && item.Project.ID) {
            dimensions = dimensions || { ProjectID: 0 };
            dimensions.ProjectID = item.Project.ID;
        }
        return <any>{
            AccountID: undefined,
            Description: item.Description,
            FinancialDate: safeDate,
            Amount: item.Amount,
            Dimensions: dimensions
        };
    }

    private createAccountSuperLabel(list: IAccount[]): IAccount[] {
        if (list === undefined) { return []; }
        list.forEach( x => x.superLabel = `${x.AccountNumber} - ${x.AccountName}`);
        return list;
    }

    private createVatSuperLabel(list: IVatType[]): IVatType[] {
        if (list === undefined) { return []; }
        list.forEach( x => x.superLabel = `${x.VatPercent}% - ${x.Name}`);
        return list;
    }

    public addRow(debetAccountID: number, amount: number, date: Date, text = '') {
        const item = new DebitCreditEntry();
        const acc = this.accounts.find( x => x.ID === debetAccountID);
        if (acc) {
            item.DebetAccountID = debetAccountID;
            item.Debet = acc;
            if (acc.VatTypeID) {
                item.VatType = this.vatTypes.find( x => x.ID === acc.VatTypeID);
            }
        }
        item.Amount = amount;
        item.FinancialDate = date;
        item.Description = text;
        this.items.push(item);
        this.balance = this.calcTotal();
    }


    public setValue(fieldName: string, newValue: any, rowIndex: number, row?: DebitCreditEntry) {
        const match = this.items[rowIndex];
        switch (fieldName) {
            case 'Debet':
                this.setAccount(match, newValue, true);
                this.setAccount(row, newValue, true);
                break;
            case 'Credit':
                this.setAccount(match, newValue, false);
                this.setAccount(row, newValue, false);
                break;
            case 'Amount':
                match.Amount = safeDec(newValue);
                break;
        }
        this.balance = this.calcTotal();
    }

    private setAccount(item: DebitCreditEntry, acc: IAccount, isDebet = true) {
        if (acc) {
            if (isDebet) {
                item.DebetAccountID = acc.ID;
                item.Debet = acc;
            } else {
                item.CreditAccountID = acc.ID;
                item.Credit = acc;
            }
            if (acc.VatTypeID) {
                item.VatType = this.vatTypes.find( x => x.ID === acc.VatTypeID);
            }
        }
    }


    public ensureRowCount(requiredRows = 5) {
        const n = this.items.length;
        if (n < requiredRows) {
            for (let i = n; i < requiredRows; i++) {
                this.items.push(new DebitCreditEntry());
            }
        }
    }


    private calcTotal(): number {
        let sum = 0;
        this.items.forEach( x => {
            if (!x.Amount) { return; }
            let value = x.Amount;
            if (x.Debet && x.Credit) { value = 0; } else if (x.Credit) { value = -value; }
            sum += value;
        });
        return sum;
    }

    public query(route: string, ...args: any[]) {
        let params = '';
        for (let i = 0; i < args.length; i += 2) {
            params += (i === 0 ? '?' : '&') + `${args[i]}=${args[i + 1]}`;
        }
        return this.HttpGet(route + params);
    }

    private HttpGet(route: string) {
        return this.statisticsService.GetHttp()
            .usingBusinessDomain()
            .asGET()
            .withEndPoint(route)
            .send({}, undefined, true)
            .map(response => response.body);
    }

    private HttpPost(route: string, body: any) {
        return this.statisticsService.GetHttp()
            .usingBusinessDomain()
            .asPOST()
            .withBody(body)
            .withEndPoint(route)
            .send({}, undefined, true)
            .map(response => response.body);
    }
}
