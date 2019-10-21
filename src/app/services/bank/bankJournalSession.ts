import { Injectable } from '@angular/core';
import { StatisticsService } from '../common/statisticsService';
import { forkJoin } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { BankUtil } from './bankStatmentModels';
import { safeDec, toIso } from '@app/components/common/utils/utils';
import {Observable} from 'rxjs';
import { FinancialYearService } from '../accounting/financialYearService';
import { DebitCreditEntry, IAccount, IVatType, INumberSerie, PaymentInfo, IJournal, PaymentMode } from './bankjournalmodels';
export * from './bankjournalmodels';

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
    public payment: PaymentInfo = new PaymentInfo();

    constructor(private statisticsService: StatisticsService, private financialYearService: FinancialYearService) {
        this.currentYear = (this.financialYearService.getActiveFinancialYear().Year || new Date().getFullYear());
    }

    clear() {
        this.items = [];
        this.payment = new PaymentInfo();
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

    initialize(preloadAccountID?: number, defaultSerieName?: string) {
        this.clear();
        this.accounts = [];
        this.busy = true;

        const apiRequests = [
            this.HttpGet(`vattypes`),
            this.HttpGet(`number-series?action=get-active-numberseries&entityType=JournalEntry&year=${this.currentYear}`)
        ];

        if (preloadAccountID) {
            apiRequests.push(this.getAccountByID(preloadAccountID));
        }

        return forkJoin(...apiRequests
        ).pipe(
            tap(res => {
                this.vatTypes = this.createVatSuperLabel(res[0]);
                this.setupSeries(res[1], defaultSerieName);
                if (res[2]) {
                    this.accounts = this.createAccountSuperLabel(Array.isArray(res[2]) ? res[2] : [res[2]]);
                }
            }),
            finalize (() => this.busy = false)
        );
    }

    private setupSeries(list, keyWord?: string) {
        if (Array.isArray(list) && list.length > 0) {
            this.series = list;
            if (this.series.length > 1 && keyWord) {
                this.selectedSerie = this.series.find( x => x.Name.toLowerCase().indexOf(keyWord) >= 0);
            }
            this.selectedSerie = this.selectedSerie || this.series[0];
        }
    }

    public convertToExpense() {
        this.balance = this.calcTotal();
        const jr = this.convertToJournal();
        const content = (jr && jr.length > 0) ? jr[0] : {
            DraftLines: [],
            FileIDs: [],
            Payments: [{}],
            Description: 'Return expense'
        };
        if (this.payment.Mode === PaymentMode.PrepaidWithCompanyBankAccount) {
            content.Description = 'Prepaid expense';
            // Add virtual item
            if (this.payment && this.payment.PaidWith) {
                this.cacheAccount(this.payment.PaidWith);
                const dc = this.addRow(this.payment.PaidWith.ID, 0, this.payment.PaymentDate, 'Utlegg', true );
                const jln = this.convertToJournalEntry(dc);
                jln.AccountID = this.payment.PaidWith.ID;
                jln.Amount = -this.balance;
                content.DraftLines.push(jln);
            }
        }
        return [content];
    }

    public validate(): { success: boolean; messages?: string[] } {

        if (this.items === undefined || this.items.length === 0) {
            return { success: false, messages: ['Ingen posteringer'] };
        }

        if (this.balance === 0 && this.payment.Mode !== PaymentMode.None) {
            return { success: false, messages: ['Betalingen må ha konteringsdetaljer'] };
        }

        if (this.balance !== 0 && this.payment.Mode === PaymentMode.None) {
            return { success: false, messages: ['Det er differanse i bilaget'] };
        }

        let validItems = 0;
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (item.Amount && (item.Debet || item.Credit)) {
                validItems++;
            }
        }
        if (validItems === 0) {
            return { success: false, messages: ['Det mangler gyldige konteringer'] };
        }

        return { success: true };
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
                    if (item.DebetVatTypeID !== undefined) { debet.VatTypeID = item.DebetVatTypeID; }
                    entry.DraftLines.push(debet);
                    balance = BankUtil.safeAdd(balance, debet.Amount);
                }
                if (item.Credit) {
                    const credit = this.convertToJournalEntry(item);
                    credit.AccountID = item.Credit.ID;
                    if (item.CreditVatTypeID !== undefined) { credit.VatTypeID = item.CreditVatTypeID; }
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

    public load(entry: IJournal): Observable<IJournal> {
        this.clear();
        const lines = entry.DraftLines.map( x => {});
        return null;
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
        if (id && id < 0) {
            return undefined;
        }
        const acc = this.accounts.find( x => x.ID === id);
        if (acc) { return Observable.from([acc]); }
        return this.HttpGet(`accounts/${id}?select=ID,AccountNumber,AccountName,VatTypeID`)
            .pipe(tap(res => {
                this.cacheAccount(res);
            }));
    }

    public cacheAccount(acc) {
        if (!(acc && acc.ID)) { return; }
        const match = this.accounts.find( x => x.ID === acc.ID);
        if (!match) {
            console.log('caching accoung:' + acc.ID, acc);
            this.createAccountSuperLabel([acc]);
            this.accounts.push(acc);
        }
    }

    public addRow(debetAccountID: number, amount: number, date: Date, text = '', virtual = false) {
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
        if (!virtual) {
            this.items.push(item);
            this.balance = this.calcTotal();
        }
        return item;
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
                if (isDebet) {
                    item.CreditVatTypeID = undefined;
                    item.DebetVatTypeID = acc.VatTypeID;
                } else {
                    item.DebetVatTypeID = undefined;
                    item.CreditVatTypeID = acc.VatTypeID;
                }
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

    public statisticsQuery(query: string) {
        return this.statisticsService.GetAll(query);
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
