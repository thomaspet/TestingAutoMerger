import { Injectable } from '@angular/core';
import { forkJoin, Subject, BehaviorSubject } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { BankStatementMatch, BankStatementEntry, JournalEntryLine } from '@uni-entities';
import { BankStatementEntryService } from './bankStatementEntryService';
import { StatisticsService } from '../common/statisticsService';
import { BankStatementService } from './bankStatementService';
import * as moment from 'moment';
import { IMatchEntry, BankUtil, StageGroup, BankStatmentMatchDto } from './bankStatmentModels';
export { IMatchEntry } from './bankStatmentModels';

export enum BankSessionStatus {
    NoData = 1,
    MissingBankEntries = 2,
    ReadyToMatch = 3,
    ReadyToJournal = 4,
    UnmatchedJournal = 5,
    CompleteIfSaved = 6,
    Complete = 7,
    HasPostsInOtherTabs = 8,
    HasCustomerMatch = 9,
    HasSupplierMatch = 10
}

export enum JournalEntryListMode {
    Original = 0,
    Customer = 1,
    Supplier = 2
}

@Injectable()
export class BankStatementSession {
    busy: boolean;
    loading$: Subject<boolean> = new Subject();
    preparing: boolean;
    closedGroups: StageGroup[] = [];
    stage: Array<IMatchEntry> = [];
    bankEntries: Array<IMatchEntry> = [];
    journalEntries: Array<IMatchEntry> = [];
    journalEntriesOriginal: Array<IMatchEntry> = [];
    journalEntriesCustomer: Array<IMatchEntry> = [];
    journalEntriesSupplier: Array<IMatchEntry> = [];
    ledgerAccountID: number;
    stageTotal: number = 0;
    canCloseStage: boolean = false;
    suggestions: Array<BankStatmentMatchDto>;
    stageHasOnlyBankEntries: boolean = false;

    journalEntryMode: JournalEntryListMode = 0;
    hasCheckedOpenPosts = false;

    savedJournalEntrySuggestionID: number = 0;

    originalCounter = 0;
    customerCounter = 0;
    supplierCounter = 0;

    bankBalance: number;
    journalEntryBalance: number;
    totalImbalance: number;

    status: BankSessionStatus = BankSessionStatus.NoData;
    statusText: string = '';

    cantAddEntry = new Subject<string>();

    stageInfo = { bank: { count: 0, balance: 0 }, journal: { count: 0, balance: 0 } };

    private _prevStartDate: Date;
    private _prevEndDate: Date;
    private _reconcileStartDate: Date;

    constructor(
        private bankStatementEntryService: BankStatementEntryService,
        private bankStatementService: BankStatementService,
        private statisticsService: StatisticsService
    ) { }

    reload() {
        return this.load(this._prevStartDate, this._prevEndDate, undefined, this._reconcileStartDate);
    }

    load(startDate: Date, endDate: Date, ledgerAccountID?: number, reconcileStartDate?: Date) {
        this.clear();
        this._prevStartDate = startDate;
        this._prevEndDate = endDate;
        this._reconcileStartDate = reconcileStartDate;
        this.busy = true;
        this.loading$.next(true);
        this.ledgerAccountID = ledgerAccountID || this.ledgerAccountID;

        const fromDateString = moment(startDate).format('YYYY-MM-DD');
        const toDateString = moment(endDate).format('YYYY-MM-DD');
        let startYear = <Date>(this.firstOfMonth(reconcileStartDate) || new Date(startDate.getFullYear(), 0, 1));
        if (startYear.getFullYear() < startDate.getFullYear()) {
            startYear = new Date(startDate.getFullYear(), 0, 1);
        }
        const startYearString = moment(startYear).format('YYYY-MM-DD');

        const journalEntryQuery = `model=journalentryline&select=ID as ID,JournalEntryNumber as JournalEntryNumber`
            + `,FinancialDate as Date,InvoiceNumber as InvoiceNumber,Description as Description,Amount as Amount`
            + ',RestAmount as OpenAmount,JournalEntryID as JournalEntryID'
            + `,StatusCode as StatusCode`
            + `&filter=AccountID eq ${this.ledgerAccountID}`
            + ` and ( financialdate ge '${fromDateString}' or ( isnull(statuscode,0) lt 31003 and financialdate ge '${startYearString}' ))`
            + ` and financialdate le '${toDateString}' and isnull(statuscode,0) ne 31004`
            + `&orderby=statuscode,financialdate&distinct=false`;

        const journalEntryCustomerQuery = `model=JournalEntryLine&select=ID as ID,JournalEntryNumber as JournalEntryNumber,casewhen(isnull(duedate,'20991231') eq '20991231',financialdate,duedate) as Date,`
        + `InvoiceNumber as InvoiceNumber,Description as Description,Amount as Amount,RestAmount as OpenAmount,JournalEntryID as JournalEntryID,`
        + `StatusCode as StatusCode,AccountID as AccountID,Info.Name as AccountName,SubAccount.ID as SubAccountID,SubAccount.AccountName as SubAccountName`
        + `&filter=SubAccount.CustomerID gt 0 and ( casewhen(isnull(duedate,'20991231') eq '20991231',financialdate,duedate) ge '${fromDateString}' or ( isnull(statuscode,0) lt 31003 and casewhen(isnull(duedate,'20991231') eq '20991231',financialdate,duedate) ge '${startYearString}' ))`
        + ` and casewhen(isnull(duedate,'20991231') eq '20991231',financialdate,duedate) le '${toDateString}' and isnull(statuscode,0) ne 31004`
        + `&expand=SubAccount,SubAccount.Customer,SubAccount.Customer.Info&orderby=statuscode,casewhen(isnull(duedate,'20991231') eq '20991231',financialdate,duedate)&distinct=false`;

        const journalEntrySupplierQuery = `model=JournalEntryLine&select=ID as ID,JournalEntryNumber as JournalEntryNumber,casewhen(isnull(duedate,'20991231') eq '20991231',financialdate,duedate) as Date,`
        + `InvoiceNumber as InvoiceNumber,Description as Description,Amount as Amount,RestAmount as OpenAmount,JournalEntryID as JournalEntryID,`
        + `StatusCode as StatusCode,AccountID as AccountID,Info.Name as AccountName,SubAccount.ID as SubAccountID,SubAccount.AccountName as SubAccountName`
        + `&filter=SubAccount.SupplierID gt 0 and ( casewhen(isnull(duedate,'20991231') eq '20991231',financialdate,duedate) ge '${fromDateString}' or ( isnull(statuscode,0) lt 31003 and casewhen(isnull(duedate,'20991231') eq '20991231',financialdate,duedate) ge '${startYearString}' ))`
        + ` and casewhen(isnull(duedate,'20991231') eq '20991231',financialdate,duedate) le '${toDateString}' and isnull(statuscode,0) ne 31004`
        + `&expand=SubAccount,SubAccount.Supplier,SubAccount.Supplier.Info&orderby=statuscode,casewhen(isnull(duedate,'20991231') eq '20991231',financialdate,duedate)&distinct=false`;

        const journalEntries$ = this.statisticsService.GetAllUnwrapped(journalEntryQuery);
        const journalEntriesCustomer$ = this.statisticsService.GetAllUnwrapped(journalEntryCustomerQuery);
        const journalEntriesSupplier$ = this.statisticsService.GetAllUnwrapped(journalEntrySupplierQuery);
        const bankEntries$ = this.bankStatementEntryService.getEntriesWithOpenHistory(this.ledgerAccountID, startDate, endDate);

        const journalEntryBalanceQuery = `model=journalentryline&select=sum(amount) as sum`
            + `&filter=accountid eq ${this.ledgerAccountID} and financialdate le '${toDateString}'`;

        const journalBalance$ = this.statisticsService.GetAllUnwrapped(journalEntryBalanceQuery);
        const bankBalance$ = this.bankStatementService.getAccountBalance(this.ledgerAccountID, endDate);

        return forkJoin(
            bankEntries$,
            journalEntries$,
            bankBalance$,
            journalBalance$,
            journalEntriesCustomer$,
            journalEntriesSupplier$
        ).pipe(
            tap(res => {
                const bankEntries = this.mapBankEntries(res[0] || []);
                this.bankEntries = this.sortEntries(bankEntries);
                this.journalEntriesOriginal = this.mapJournalEntries(res[1] || []);

                this.journalEntriesCustomer = this.mapJournalEntries(res[4] || [], JournalEntryListMode.Customer);
                this.journalEntriesSupplier = this.mapJournalEntries(res[5] || [], JournalEntryListMode.Supplier);

                this.selectJournalEntries(this.journalEntryMode || JournalEntryListMode.Original);

                this.bankBalance = res[2] && res[2].Balance;
                this.journalEntryBalance = res[3] && res[3][0] && res[3][0].sum;
                this.totalImbalance = (this.bankBalance || 0) - (this.journalEntryBalance || 0);

                this.loading$.next(false);
            }),
            finalize (() => this.busy = false)
        );
    }

    get totalTransactions(): number {
        return this.journalEntries.length + this.bankEntries.length;
    }

    selectJournalEntries(mode: JournalEntryListMode) {

        if (mode !== this.journalEntryMode) {
            this.closedGroups = [];
        }

        this.journalEntryMode = mode;

        switch (this.journalEntryMode) {
            case JournalEntryListMode.Original:
                this.journalEntries = this.journalEntriesOriginal;
                break;
            case JournalEntryListMode.Customer:
                this.journalEntries = this.journalEntriesCustomer;
                break;
            case JournalEntryListMode.Supplier:
                this.journalEntries = this.journalEntriesSupplier;
                break;
            default:
                this.journalEntries = this.journalEntriesOriginal;
                break;
        }

        this.journalEntries = this.sortEntries([...this.journalEntries]);
        this.bankEntries = this.sortEntries(this.bankEntries);

        this.refreshJournalEntryLineCounters();
        this.clearSuggestions();

        this.status = this.calcStatus();
    }

    changeToSeeMatch(mode: number) {
        this.journalEntryMode = mode;

        if (mode === JournalEntryListMode.Customer) {
            this.journalEntries = this.journalEntriesCustomer;
        } else {
            this.journalEntries = this.journalEntriesSupplier;
        }

        this.journalEntries = this.sortEntries([...this.journalEntries]);
        const index = this.journalEntries.findIndex(e => e.ID === this.savedJournalEntrySuggestionID);

        if (index > -1) {
            this.tryCheck(this.journalEntries[index]);
        }

        this.status = this.calcStatus();
        this.savedJournalEntrySuggestionID = 0;
    }

    clear() {
        this.clearStage();
        this.status = BankSessionStatus.NoData;
        this.suggestions = undefined;
        this.closedGroups = [];
        this.bankEntries = [];
        this.journalEntries = [];
        this.bankBalance = 0;
        this.totalImbalance = 0;
        this.journalEntryBalance = 0;
        this.stageInfo = { bank: { count: 0, balance: 0 }, journal: { count: 0, balance: 0 } };
    }

    reset() {
        this.clearStage();
        this.resetSuggestions();
        this.closedGroups = [];
        this.bankEntries.forEach( x => x.StageGroupKey = undefined );
        this.journalEntries.forEach( x => x.StageGroupKey = undefined );
        this.stageInfo = { bank: { count: 0, balance: 0 }, journal: { count: 0, balance: 0 } };
        this.status = this.calcStatus();
    }

    resetGroup(groupKey: string) {
        const group = this.closedGroups.find(g => g.key === groupKey);
        if (group) {
            group.items.forEach(item => {
                item.StageGroupKey = undefined;
                if (item.IsBankEntry) {
                    this.addInfo(this.stageInfo.bank, item.OpenAmount, true);
                } else {
                    this.addInfo(this.stageInfo.journal, item.OpenAmount, true);
                }
            });

            this.closedGroups = this.closedGroups.filter(g => g.key !== groupKey);
            this.resetSuggestions();
            this.status = this.calcStatus();
        } else {
            console.warn('Unable to find group in BankStatementSession > resetGroup(..)');
        }
    }

    checkOrUncheck(item: IMatchEntry) {
        if (item.Closed || item.StageGroupKey) {
            this.stageTotal = this.sumStage();
        } else {
            this.stageTotal = this.isStaged(item) ? this.stageRemove(item) : this.stageAdd(item);
        }
    }

    tryCheck(item: IMatchEntry): boolean {
        if (item.Closed || item.StageGroupKey || item.Checked) { return false; }
        this.stageTotal = this.stageAdd(item, true);
        return true;
    }

    closeStage(): Promise<any> {

        return new Promise((resolve) => {
            const group = new StageGroup();

            if (BankUtil.isCloseToZero(this.stageTotal) && this.stage.length > 0) {
                this.stage.forEach( x => {
                    group.key = BankUtil.createGuid();
                    group.items.push(x);
                    group.balance = this.addItemSum(group.balance, x);
                    x.StageGroupKey = group.key;
                    x.Checked = false;
                    if (x.IsBankEntry) {
                        this.addInfo(this.stageInfo.bank, x.OpenAmount);
                    } else {
                        this.addInfo(this.stageInfo.journal, x.OpenAmount);
                    }
                });
                this.closedGroups.push(group);

                // If we are matching with Suppliers og Customers, resolve prepared groups..
                if (this.journalEntryMode === JournalEntryListMode.Supplier || this.journalEntryMode === JournalEntryListMode.Customer) {
                    resolve(this.prepareGroups());
                } else {
                    this.clearStage();
                    this.status = this.calcStatus();
                    resolve(true);
                }
            } else {
                resolve(false);
            }
        });
    }

    clearStage() {
        this.bankEntries.forEach( x => x.Checked = false );
        this.journalEntries.forEach( x => x.Checked = false );
        this.stageHasOnlyBankEntries = false;
        this.stage.length = 0;
        this.stageTotal = 0;
        this.canCloseStage = false;
    }

    clearSuggestions() {
        this.suggestions = undefined;
    }

    saveChanges() {
        this.busy = true;
        this.loading$.next(true);
        this.preparing = true;
        return this.bankStatementService.matchItems(this.prepareGroups())
            .pipe(finalize(() => {
                return this.updateAfterMatch();
            }));
    }

    updateAfterMatch(): boolean {

        // Set all saved items to closed locally
        this.closedGroups.forEach( x => {
            x.items.forEach(item => {
                item.Closed = true;
                item.StageGroupKey = null;
            });
        });

        // Reset closed groups and busy indicators
        this.closedGroups = [];
        this.preparing = false;
        this.busy = false;
        this.loading$.next(false);

        this.selectJournalEntries(this.journalEntryMode);

        return true;
    }

    refreshJournalEntryLineCounters() {
        this.originalCounter = this.journalEntriesOriginal.filter(line => !line.Closed).length;
        this.customerCounter = this.journalEntriesCustomer.filter(line => !line.Closed).length;
        this.supplierCounter = this.journalEntriesSupplier.filter(line => !line.Closed).length;
    }

    requestSuggestions(options?: { MaxDayOffset: number, MaxDelta: number }) {
        this.preparing = true;
        this.suggestions = undefined;
        const req = {
            JournalEntries: this.journalEntries.filter( x => !x.Closed),
            BankEntries: this.bankEntries.filter( x => !x.Closed),
            Settings: options || {
                MaxDayOffset: 5, MaxDelta: 0.0
            }
        };
        return this.bankStatementService.suggestMatch(req).finally(() => this.preparing = false);
    }

    requestSuggestionsOnAll(entries, options?: { MaxDayOffset: number, MaxDelta: number }) {
        this.preparing = true;
        this.suggestions = undefined;
        const req = {
            JournalEntries: entries,
            BankEntries: this.bankEntries.filter( x => !x.Closed),
            Settings: options || {
                MaxDayOffset: 5, MaxDelta: 0.0
            }
        };
        return this.bankStatementService.suggestMatch(req).finally(() => this.preparing = false);
    }

    tryNextSuggestion(list?: BankStatementMatch[], options?: {MaxDayOffset: number, MaxDelta: number}, force = false): boolean {
        this.clearStage();
        this.suggestions = list || this.suggestions;
        if (this.suggestions === undefined) {
            this.requestSuggestions(options).subscribe( x => { if (x) { this.tryNextSuggestion(x); } } );
            return false;
        }

        if (this.suggestions.length > 0) {
            const grp = this.suggestions.find( x => !this.isSuggestionUsed(x));
            if (grp) {
                let suggestionAdded = false;
                this.suggestions.forEach( (x: BankStatementMatch) => {
                    if (x.Group === grp.Group) {
                        const b1 = x.BankStatementEntryID ? this.bankEntries.find( b => b.ID === x.BankStatementEntryID ) : undefined;
                        const j1 = x.JournalEntryLineID ? this.journalEntries.find( j => j.ID === x.JournalEntryLineID ) : undefined;
                        let used = false;
                        if (b1) { used = this.tryCheck(b1); }
                        if (j1) { used = this.tryCheck(j1) || used; }
                        x['_used'] = used;
                        suggestionAdded = used;
                    }
                });

                return suggestionAdded;
            }
        } else if (this.journalEntryMode === 0 && (!this.hasCheckedOpenPosts || force)) {

            const entries = [].concat(this.journalEntriesCustomer, this.journalEntriesSupplier).filter(x => !x.Closed);
            this.requestSuggestionsOnAll(entries, options).subscribe(res => {
                this.hasCheckedOpenPosts = true;
                if (res?.length) {
                    const currentEntryMatch = entries.find(entry => entry.ID === res[0].JournalEntryLineID);
                    const bankEntry = this.bankEntries.find(entry => entry.ID === res[0].BankStatementEntryID);
                    if (currentEntryMatch.Mode === JournalEntryListMode.Customer) {
                        this.status = 9;
                    } else {
                        this.status = 10;
                    }
                    if (bankEntry) {
                        this.tryCheck(bankEntry);
                    }
                    this.savedJournalEntrySuggestionID = res[0].JournalEntryLineID;
                }
                return false;
            });

        }
        return false;
    }

    // private

    private isSuggestionUsed(x) {
        if (x['_used']) { return true; }
        let entry = x.BankStatementEntryID ? this.bankEntries.find( b => b.ID === x.BankStatementEntryID ) : undefined;
        if (entry && (entry.Closed || entry.Checked || entry.StageGroupKey )) {
            return true;
        }
        entry = x.JournalEntryLineID ? this.journalEntries.find( j => j.ID === x.JournalEntryLineID ) : undefined;
        if (entry && (entry.Closed || entry.Checked || entry.StageGroupKey )) {
            return true;
        }
        return false;
    }

    private calcStatus(): BankSessionStatus {
        this.statusText = '';

        if (this.bankEntries.length === 0) {
            return BankSessionStatus.MissingBankEntries;
        }

        const bankInfo = this.countEntries(this.bankEntries);
        const journalInfo = this.countEntries(this.journalEntries);

        // Has open, unmatched items ?
        if (bankInfo.openCount > 0) {
            // Has open journalentries ?
            if (journalInfo.openCount > 0) { return BankSessionStatus.ReadyToMatch; }
            // Ok, they probably should be posted?
            if (this.originalCounter || this.customerCounter || this.supplierCounter) {
                this.setStatusText();
                return BankSessionStatus.HasPostsInOtherTabs;
            }
            return BankSessionStatus.ReadyToJournal;
        }

        // Ready to save and complete?
        if (bankInfo.stagedCount > 0 && journalInfo.stagedCount > 0) {
            return (bankInfo.openCount === 0 && journalInfo.openCount === 0)
                ?  BankSessionStatus.CompleteIfSaved : BankSessionStatus.ReadyToMatch;
        }

        // Only journalentries ?
        if (journalInfo.openCount > 0) {
            return BankSessionStatus.UnmatchedJournal;
        }

        return BankSessionStatus.Complete;
    }

    setStatusText() {

        this.statusText = ` Du har bankposter som ikke finnes ${ this.journalEntryMode === 0 ? 'i regnskapet' : this.journalEntryMode === 1 ? 'på kunder' : 'på leverandører' }. `;
        if (this.journalEntryMode !== JournalEntryListMode.Original && this.originalCounter) {
            this.statusText += 'Det er flere poster under regnskapsfanen';
        } else if (this.journalEntryMode !== JournalEntryListMode.Customer && this.customerCounter) {
            this.statusText += 'Det er flere poster under kundefanen';
        } else if (this.journalEntryMode !== JournalEntryListMode.Supplier && this.customerCounter) {
            this.statusText += 'Det er flere poster under leverandørfanen';
        }
    }

    private countEntries(list: IMatchEntry[]): { openCount: number, stagedCount: number } {
        const diff = { openCount: 0, stagedCount: 0 };
        list.forEach( x => {
            if (!x.Closed) {
                if (x.StageGroupKey) {
                    diff.stagedCount++;
                } else {
                    diff.openCount++;
                }
            }
        });
        return diff;
    }

    private resetSuggestions() {
        if (this.suggestions !== undefined && this.suggestions.length > 0) {
            this.suggestions.forEach( x => x['_used'] = undefined);
        }
    }

    private prepareGroups(): BankStatementMatch[] {
        const list = [];
        this.closedGroups.forEach( x => {
            x.addMatchEnties(list);
        });
        return list;
    }

    private sortEntries(list: IMatchEntry[]) {
        return list.sort( (a, b) => a.Closed === b.Closed ? (a.Date > b.Date ? 1 : a.Date === b.Date ? 0 : -1)
            : a.Closed < b.Closed ? -1 : 1 );
    }

    private stageAdd(item: IMatchEntry, systemCheck = false): number {
        const checkedJE = this.journalEntries.filter(je => je.Checked).length;
        const checkedBE = this.bankEntries.filter(je => je.Checked).length;

        // Dont allow match many to many ?
        if (this.journalEntryMode !== JournalEntryListMode.Original &&
            ((item.IsBankEntry && checkedBE >= 1 && checkedJE > 1) || (!item.IsBankEntry && checkedBE > 1 && checkedJE >= 1))) {
            this.cantAddEntry.next('Kan ikke matche mange mot mange på begge sider. Du må avstemme imellom hver match eller bruke automatisk avstemming.');
            return this.stageTotal;
        }

        this.stage = this.stage || [];
        this.stage.push(item);
        item.Checked = true;
        this.stageTotal = this.sumStage();
        this.stageHasOnlyBankEntries = !this.stage.find(entry => !entry.IsBankEntry);

        // If system suggested values, push the entries marked to the top of the list
        if (systemCheck) {
            if (item.IsBankEntry) {
                const index = this.bankEntries.findIndex(entry => entry.ID === item.ID);
                this.bankEntries.unshift(this.bankEntries.splice(index, 1)[0]);
            } else {
                const index = this.journalEntries.findIndex(entry => entry.ID === item.ID);
                this.journalEntries.unshift(this.journalEntries.splice(index, 1)[0]);
            }
        }

        return this.stageTotal;
    }

    private addInfo(info: { count: number, balance: number }, amount: number, remove = false) {
        info.count += remove ? -1 : 1;
        info.balance = BankUtil.safeAdd(info.balance, remove ? -amount : amount);
    }

    private stageRemove(item: IMatchEntry): number {
        if (!item.Checked) { return this.stageTotal; }
        if (this.stage.length === 0) { return 0; }
        const index = this.stage.indexOf( item );
        if (index >= 0) {
            item.Checked = false;
            this.stage.splice(index, 1);
            this.stageTotal = this.sumStage();
        }
        this.stageHasOnlyBankEntries = this.stage.length && !this.stage.find(entry => !entry.IsBankEntry);
        return this.stageTotal;
    }

    private isStaged(item: IMatchEntry): boolean {
        if (this.stage === undefined || this.stage.length === 0) { return false; }
        return this.stage.indexOf(item) >= 0;
    }

    private sumStage(): number {
        return this.stage.reduce((diff, item) => {
            diff = this.addItemSum(diff, item);
            this.canCloseStage = BankUtil.isCloseToZero(diff);
            return diff;
        }, 0);
    }

    private addItemSum(sum: number, item: IMatchEntry): number {
        return BankUtil.safeAdd(sum, item.OpenAmount * (item.IsBankEntry ? 1 : -1));
    }

    private mapJournalEntries(list: Array<any>, listMode: JournalEntryListMode = 0): IMatchEntry[] {
        return list.map( x => {
            const calcOpen = x.StatusCode === 31001 ? x.Amount : (x.OpenAmount === 0 ? 0 : (x.OpenAmount || x.Amount));
            const isClosed = x.StatusCode >= 31003;
            return <IMatchEntry>{
                ID: x.ID,
                Date: new Date(x.Date),
                Description: x.Description,
                Amount: x.Amount,
                OpenAmount: calcOpen,
                JournalEntryNumber: x.JournalEntryNumber || '',
                IsBankEntry: false,
                Mode: listMode,
                Checked: false,
                Closed: isClosed,
                JournalEntryID: x.JournalEntryID,
                SubAccountID: x.SubAccountID,
                SubAccountName: x.SubAccountName
            };
        });
    }

    private mapBankEntries(list: BankStatementEntry[]): IMatchEntry[] {
        return list.map( x => {
            const isClosed = (x.StatusCode || 0) >= 48002;
            return <IMatchEntry> {
                ID: x.ID,
                Date: new Date(<any> x.BookingDate),
                Description: x.Description,
                Amount: x.Amount,
                OpenAmount: x.OpenAmount,
                IsBankEntry: true,
                Checked: false,
                Closed: isClosed
            };
        });
    }

    private firstOfMonth(date) {
        if (!date) { return date; }
        if (date.getMonth) {
            return new Date(date.getFullYear(), date.getMonth(), 1 );
        }
        const td = moment(date).toDate();
        if (td.getMonth) {
            return this.firstOfMonth(td);
        }
        return date;
    }
}
