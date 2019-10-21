import { Injectable } from '@angular/core';
import { StatisticsService } from '../common/statisticsService';
import { forkJoin } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { BankUtil } from './bankStatmentModels';
import { safeDec, toIso } from '@app/components/common/utils/utils';
import {Observable} from 'rxjs';
import { FinancialYearService } from '../accounting/financialYearService';

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

export interface INumberSerie {
    ID: number;
    DisplayName: string;
    Name: string;
}

export interface IJournal {
    DraftLines: Array<any>;
    NumberSeriesID?: number;
    NumberSeriesTaskID?: number;
    FileIDs?: Array<number>;
}

@Injectable()
export class BankJournalSession {

    public items: DebitCreditEntry[] = [];
    public accounts: Array<IAccount> = [];
    public vatTypes: Array<IVatType> = [];
    public busy = false;
    public balance = 0;
    public currentYear = 0;
    public series: Array<INumberSerie> = [];
    public selectedSerie: INumberSerie;

    constructor(private statisticsService: StatisticsService, private financialYearService: FinancialYearService) {
        this.currentYear = (this.financialYearService.getActiveFinancialYear().Year || new Date().getFullYear());
    }

    clear() {
        this.items = [];
        this.busy = false;
    }

    save(asDraft = false) {
        this.busy = true;
        const cargo = this.convertToJournal(asDraft);
        const route = asDraft ? 'journalentries?action=save-journal-entries-as-draft' : 'journalentries?action=book-journal-entries';
        return this.HttpPost(route, cargo).finally( () => this.busy = false );
    }

    recalc() {
        this.balance = this.calcTotal();
    }

    initialize(preloadAccountID?: number) {
        this.clear();
        this.accounts = [];
        this.busy = true;

        const accountLoader = preloadAccountID
            ? this.getAccountByID(preloadAccountID)
            : this.statisticsService.GetAllUnwrapped('model=account&select=id as ID,accountnumber as AccountNumber'
                + `,accountname as AccountName,vattypeid as VatTypeID`
                + '&filter=accountnumber ge 1000 and accountnumber le 9999 and visible eq 1&orderby=accountnumber');
        const vatLoader = this.HttpGet(`vattypes`);
        const seriesLoader = this.HttpGet('number-series?action=get-active-numberseries&entityType=JournalEntry&year='
            + this.currentYear);
        return forkJoin(
            accountLoader,
            vatLoader,
            seriesLoader
        ).pipe(
            tap(res => {
                this.accounts = this.createAccountSuperLabel(Array.isArray(res[0]) ? res[0] : [res[0]]);
                this.vatTypes = this.createVatSuperLabel(res[1]);
                this.setupSeries(res[2]);
            }),
            finalize (() => this.busy = false)
        );
    }

    private setupSeries(list, keyWord = 'bank') {
        if (Array.isArray(list) && list.length > 0) {
            this.series = list;
            if (this.series.length > 1) {
                this.selectedSerie = this.series.find( x => x.Name.toLowerCase().indexOf(keyWord) >= 0);
            }
            this.selectedSerie = this.selectedSerie || this.series[0];
        }
    }

    public convertToJournal(asDraft = false) {
        let balance = 0;
        const list = [];
        let entry = this.newJournal(); // todo: lookup correct series-id
        if (asDraft) { entry['Description'] = 'Kladd fra bankavstemming'; }
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

    private newJournal(draftLines = [], seriesTaskID?: number): IJournal {
        const jj = <IJournal>{ DraftLines: draftLines, FileIDs: [] };
        if (this.selectedSerie) {
            jj.NumberSeriesID = this.selectedSerie.ID;
        } else if (seriesTaskID) {
            jj.NumberSeriesTaskID = seriesTaskID;
        }
        return jj;
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

    public getAccountByID(id: number): Observable<IAccount> {
        const acc = this.accounts.find( x => x.ID === id);
        if (acc) { return Observable.from([acc]); }
        return this.HttpGet(`accounts/${id}?select=ID,AccountNumber,AccountName,VatTypeID`)
            .pipe(tap(res => {
                this.cacheAccount(res);
            }));
    }

    public cacheAccount(acc) {
        if (!(acc && acc.ID)) { return; }
        const match = this.accounts.find( x => x.ID === acc.id);
        if (!match) {
            this.createAccountSuperLabel([acc]);
            this.accounts.push(acc);
        }
    }

    public addRow(debetAccountID: number, amount: number, date: Date, text = '') {
        const item = new DebitCreditEntry();
        const acc = this.accounts.find( x => x.ID === debetAccountID );
        if (acc) {
            if (amount > 0) {
                item.DebetAccountID = debetAccountID;
                item.Debet = acc;
            } else {
                item.CreditAccountID = debetAccountID;
                item.Credit = acc;
            }
            if (acc.VatTypeID) {
                item.VatType = this.vatTypes.find( x => x.ID === acc.VatTypeID);
            }
        }
        item.Amount = Math.abs(amount);
        item.FinancialDate = date;
        item.Description = text;
        this.items.push(item);
        this.balance = this.calcTotal();
    }


    public setValue(fieldName: string, newValue: any, rowIndex: number, row?: DebitCreditEntry) {
        const match = this.items[rowIndex];
        switch (fieldName) {
            case 'Debet':
                this.cacheAccount(newValue);
                this.setAccount(match, newValue, true);
                break;
            case 'Credit':
                this.cacheAccount(newValue);
                this.setAccount(match, newValue, false);
                break;
            case 'Amount':
                match.Amount = safeDec(newValue);
                break;
            default:
                return row;
        }
        this.balance = this.calcTotal();
        return match;
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
            sum = BankUtil.safeAdd(sum, value);
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
