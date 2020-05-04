import {Injectable} from '@angular/core';
import {StatisticsService} from '../common/statisticsService';
import {forkJoin} from 'rxjs';
import {tap, finalize} from 'rxjs/operators';
import {BankUtil, IMatchEntry} from './bankStatmentModels';
import {safeDec, toIso} from '@app/components/common/utils/utils';
import {Observable} from 'rxjs';
import {FinancialYearService} from '../accounting/financialYearService';
import {DebitCreditEntry, IAccount, IVatType, INumberSerie, PaymentInfo, IJournal, PaymentMode} from './bankjournalmodels';
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
    public bankAccounts: Array<{}>;

    public get vatTypesCost(): Array<IVatType> {
        return this.vatTypes.filter( x => !x.OutputVat );
    }

    constructor(
        private statisticsService: StatisticsService,
        private financialYearService: FinancialYearService
    ) {
        this.currentYear = (this.financialYearService.getActiveFinancialYear().Year || new Date().getFullYear());
    }

    clear() {
        this.payment.clear();
        this.items = [];
        this.busy = false;
    }

    save(asDraft = false, fileIDs?: Array<number>, includePayment = true) {
        this.busy = true;

        let cargo: any;
        switch (this.payment.Mode) {
            case PaymentMode.None:
                cargo = this.convertToJournal(asDraft);
                break;
            default:
                cargo = this.convertToExpense(fileIDs);
                break;
        }

        if (includePayment) {
            this.addPayment(cargo);
        }

        const route = asDraft ? 'journalentries?action=save-journal-entries-as-draft' : 'journalentries?action=book-journal-entries';
        return this.HttpPost(route, cargo).finally( () => this.busy = false );
    }

    addPayment(cargo) {
        if (!(this.payment.PaymentTo && this.payment.PaymentAccount && cargo && cargo.length > 0)) { return; }
        const first = cargo[0];
        first.Payments = first.Payments || [];
        first.Payments.push({
            Description: this.payment.Description,
            Amount: this.payment.Amount || this.balance,
            DueDate: BankUtil.IsoDate(this.payment.PaymentDate),
            FromBankAccountID: this.payment.SystemBankAccount.ID,
            ToBankAccountID: this.payment.PaymentAccount.ID,
            PaymentDate: BankUtil.IsoDate(this.payment.PaymentDate),
            BusinessRelationID: this.payment.PaymentTo.BusinessRelationID,
            AutoJournal: true,
            PaymentCodeID: 1
        });
    }

    getSystemBankAccounts() {
        return this.statisticsQuery('model=bankaccount&select=ID as ID,AccountID as AccountID'
        + ',BankAccountType as BankAccountType,Account.AccountNumber as AccountNumber'
        + ',Account.AccountName as AccountName,AccountNumber as BankAccountNumber,Bank.Name'
        + ',casewhen(companysettingsid gt 0 and id eq companysettings.companybankaccountid,1,0) as IsDefault'
        + '&filter=companysettingsid gt 0&expand=bank,account'
        + '&join=bankaccount.id eq companysettings.CompanyBankAccountID'
        + '&top=50&distinct=false'
        + '&orderby=casewhen(companysettingsid gt 0 and id eq companysettings.companybankaccountid,0,1)')
            .map( x => x.Data );
    }

    recalc() {
        this.balance = this.calcTotal();
    }

    initialize(mode: PaymentMode, preloadAccountID?: number, defaultSerieName?: string) {
        this.clear();
        this.accounts = [];
        this.busy = true;
        this.payment.Mode = mode;

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

    public convertToExpense(fileIDs?: Array<number>) {
        this.balance = this.calcTotal();
        const jr = this.convertToJournal();
        const content = (jr && jr.length > 0) ? jr[0] : {
            DraftLines: [],
            fileIDs: [],
            Payments: [{}],
            Description: 'Return expense'
        };
        if (this.payment.Mode !== PaymentMode.None) {

            const description = this.payment.Description || 'Utlegg';

            // Check dates and description on all entries
            content.DraftLines.forEach(x => {
                x.FinancialDate = toIso(this.payment.PaymentDate);
                x.Description = x.Description || description;
            });

            const acc = this.payment.Mode === PaymentMode.PrepaidByEmployee
                ? this.payment.PaymentTo
                : this.payment.PaidWith;

            // Add virtual item (the payment-entry)
            if (this.payment && acc) {
                this.cacheAccount(acc);
                const dc = this.addRow(acc.ID, 0, this.payment.PaymentDate, description, true );
                const jln = this.convertToJournalEntry(dc);
                jln.AccountID = acc.ID;
                jln.Amount = -this.balance;
                content.DraftLines.push(jln);
            }
        }
        if (fileIDs && fileIDs.length > 0) {
            content.fileIDs = fileIDs;
        }
        return [content];
    }

    public validate(withPayment = false): { success: boolean; messages?: string[], errField?: string } {

        if (this.payment.Mode === PaymentMode.PrepaidByEmployee) {
            if ( !this.payment.PaymentTo ) {
                return { success: false, messages: ['Mottaker må fylles ut'], errField: 'payment.PaymentTo' };
            }
            if (withPayment && !BankUtil.IsValidAccount(this.payment.PaymentAccount)) {
                return { success: false, messages: ['Ugyldig bankkonto'], errField: 'payment.PaymentAccount' };
            }
            if (withPayment && (!(this.payment.SystemBankAccount && this.payment.SystemBankAccount.ID))) {
                return { success: false, messages: ['Systemkonto for utbetaling mangler'], errField: 'payment.SystemBankAccount' };
            }
        }

        if (this.payment.Mode === PaymentMode.PrepaidWithCompanyBankAccount && !this.payment.PaidWith ) {
            return { success: false, messages: ['"Betalt fra" må fylles ut'], errField: 'payment.PaidWith' };
        }

        if (this.items === undefined || this.items.length === 0) {
            return { success: false, messages: ['Ingen posteringer'], errField: 'item.Debet' };
        }

        if (this.balance !== 0 && this.payment.Mode === PaymentMode.None) {
            return { success: false, messages: ['Det er differanse i bilaget'], errField: 'item.Amount' };
        }

        let validAccounts = 0;
        let validAmounts = 0;
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (item.Debet || item.Credit) {
                validAccounts++;
            }
            if (item.Amount) {
                validAmounts++;
            }
        }
        if (validAccounts === 0) {
            return { success: false, messages: ['Utgiftskonto mangler'], errField: 'item.Debet' };
        }
        if (validAmounts === 0) {
            return { success: false, messages: ['Beløp mangler'], errField: 'item.Amount' };
        }

        if (this.balance === 0 && this.payment.Mode !== PaymentMode.None) {
            return { success: false, messages: ['Beløp mangler'], errField: 'item.Amount' };
        }

        if (validAmounts < this.items.length || validAccounts < this.items.length) {
            return { success: false, messages: ['Du må fylle ut alle konteringslinjene'], errField: '' };
        }

        return { success: true };
    }

    public getVatSummary(): { sum: number, details: Array<{ vatPercent: number, sum: number }> } {
        let vatSum = 0;
        const vatGroups = [];
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (item.Amount && (item.Debet || item.Credit) && item.VatType) {
                const vt = item.VatType;
                const itemVatSum = (item.Amount / (100 + vt.VatPercent)) * vt.VatPercent;
                let vMatch = vatGroups.find( x => x.vatPercent === vt.VatPercent);
                if (!vMatch) {
                    vMatch = { vatPercent: vt.VatPercent, sum: itemVatSum };
                    vatGroups.push(vMatch);
                } else {
                    vMatch.sum = BankUtil.safeAdd( vMatch.sum, itemVatSum );
                }
                vatSum = BankUtil.safeAdd( vatSum, itemVatSum );
            }
        }
        return { sum: vatSum, details: vatGroups };
    }

    public convertToJournal(asDraft = false) {
        let balance = 0;
        const list = [];
        let entry = this.newJournal(); // todo: lookup correct series-id

        if (asDraft) { entry['Description'] = 'Kladd fra bankavstemming'; }
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];

            if (item.Amount) {
                if (item.files && item.files.length) {
                    entry.FileIDs.push(...item.files.map(file => file.ID));
                }

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
            this.createAccountSuperLabel([acc]);
            this.accounts.push(acc);
        } else if (!acc.superLabel) {
            this.createAccountSuperLabel([acc]);
        }
    }

    public addRowFromMatchEntry(accountID: number, entry: IMatchEntry) {
        const item = new DebitCreditEntry();
        const account = this.accounts.find( x => x.ID === accountID );
        if (account) {
            if (entry.Amount > 0) {
                item.DebetAccountID = accountID;
                item.Debet = account;
            } else {
                item.CreditAccountID = accountID;
                item.Credit = account;
            }

            if (account.VatTypeID) {
                item.VatType = this.vatTypes.find( x => x.ID === account.VatTypeID);
            }
        }

        item.Amount = Math.abs(entry.Amount);
        item.FinancialDate = entry.Date;
        item.Description = entry.Description;
        item.EntryID = entry.ID;

        this.items.push(item);
        this.balance = this.calcTotal();
        return item;
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

    addJournalingLines(lines: any[]) {
        if (!lines || !lines.length) {
            return;
        }

        lines.forEach(line => {
            if (line && line.Account) {
                const itemIndex = this.items.findIndex(item => item.EntryID === line.MatchWithEntryID);
                if (itemIndex >= 0) {
                    const item = this.items[itemIndex];
                    if (item.DebetAccountID && !item.CreditAccountID) {
                        this.setValue('Credit', line.Account, itemIndex);
                    } else if (item.CreditAccountID && !item.DebetAccountID) {
                        this.setValue('Debet', line.Account, itemIndex);
                    }
                }
            }
        });

        this.items = [...this.items];
    }

    public setValue(fieldName: string, newValue: any, rowIndex: number, row?: DebitCreditEntry) {
        const match = this.items[(rowIndex === undefined ? this.items.indexOf(row) : rowIndex)];
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
            case 'VatType':
                if (BankUtil.isString(newValue)) {
                    this.setVatType(match, parseInt(newValue, 10));
                    break;
                }
                this.setVatType(match, newValue.ID);
                break;
            default:
                return row;
        }
        this.balance = this.calcTotal();
        return match;
    }

    private setupSeries(list, keyWord?: string) {
        if (Array.isArray(list) && list.length > 0) {
            this.series = list;
            if (this.series.length > 1 && keyWord) {
                this.selectedSerie = this.series.find( x => x.Name && x.Name.toLowerCase().indexOf(keyWord) >= 0);
            }
            this.selectedSerie = this.selectedSerie || this.series[0];
        }
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

    private setAccount(item: DebitCreditEntry, acc: IAccount, isDebet = true) {
        if (acc) {
            if (isDebet) {
                item.DebetAccountID = acc.ID;
                item.Debet = acc;
            } else {
                item.CreditAccountID = acc.ID;
                item.Credit = acc;
            }
            this.setVatType(item, acc.VatTypeID, isDebet);
        }
    }

    private setVatType(item: DebitCreditEntry, vatTypeID: number, isDebet = true) {
        let setVatType;
        if (!vatTypeID) {
            if ((item['_setbydebet'] !== isDebet)) {
                return;
            }
        } else if (vatTypeID) {
            setVatType = this.vatTypes.find( x => x.ID === vatTypeID);
            if (!setVatType) { return; }
        }
        if (isDebet) {
            item.CreditVatTypeID = undefined;
            item.DebetVatTypeID = vatTypeID;
            item['_setbydebet'] = true;
        } else {
            item.DebetVatTypeID = undefined;
            item.CreditVatTypeID = vatTypeID;
            item['_setbydebet'] = false;
        }
        item.VatType = setVatType;
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

    public squery(route: string, ...args: any[]) {
        let params = '';
        for (let i = 0; i < args.length; i += 2) {
            params += `&${args[i]}=${args[i + 1]}`;
        }
        return this.statisticsService.GetAllUnwrapped(route + params);
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
