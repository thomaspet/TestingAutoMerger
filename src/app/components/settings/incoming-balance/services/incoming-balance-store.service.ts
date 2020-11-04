import { Injectable } from '@angular/core';
import { JournalEntryTypes } from '@app/services/accounting/journal-entry-type.service';
import { Account, JournalEntry, JournalEntryLineDraft, LocalDate } from '@uni-entities';
import { BehaviorSubject, combineLatest, forkJoin, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, finalize, map, switchMap, take, tap } from 'rxjs/operators';
import { IIncomingBalanceMainAccount, IIncomingBalanceMainAccountInfo, IncomingBalanceHttpService, IncomingBalanceSubAccount } from './incoming-balance-http.service';

export const balanceLineSources = ['Balance', 'Customer', 'Supplier'] as const;
export type IncomingBalanceLineSource = typeof balanceLineSources[number];

export interface IIncomingBalanceLine extends JournalEntryLineDraft {
    _balanceGuid: string;
    _source: IncomingBalanceLineSource;
    _isDirty: boolean;
    _booked: boolean;
}
@Injectable()
export class IncomingBalanceStoreService {
    //#region state
    private journalEntrySubject$: BehaviorSubject<JournalEntry> = new BehaviorSubject(null);
    public journalEntry$ = this.journalEntrySubject$.asObservable();

    private journalLinesSubject$: BehaviorSubject<IIncomingBalanceLine[]> = new BehaviorSubject(null);
    public allJournalLines$ = this.journalLinesSubject$
        .asObservable()
        .pipe(
            filter(lines => !!lines),
            map(lines => [...lines])
        );
    public journalLines$ = this.allJournalLines$
        .pipe(
            map(lines => lines.filter(line => !line.Deleted))
        );
    public isBooked$ = this.allJournalLines$
        .pipe(
            map(lines => lines.some(line => line._booked)),
            distinctUntilChanged(),
        );

    private dateSubject$: BehaviorSubject<LocalDate> = new BehaviorSubject(new LocalDate());
    public date$ = this.dateSubject$.asObservable();

    private isSavingSubject$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public isSaving$ = this.isSavingSubject$.asObservable();

    private mainAccountsSubject$: BehaviorSubject<IIncomingBalanceMainAccount[]> = new BehaviorSubject(null);
    public mainAccounts$ = this.mainAccountsSubject$.asObservable().pipe(filter(accounts => !!accounts));
    //#endregion

    constructor(private httpService: IncomingBalanceHttpService) { }

    public initData() {
        return this.journalLinesSubject$
            .pipe(
                take(1),
                filter(lines => !lines),
                switchMap(() => forkJoin([
                    this.fetchData(),
                    this.setMainAccounts(),
                ]))
            );
    }

    public clearData() {
        this.journalEntrySubject$.next(null);
        this.journalLinesSubject$.next(null);
        this.dateSubject$.next(null);
        this.mainAccountsSubject$.next(null);
    }


    public setDate(date: LocalDate) {
        this.dateSubject$.next(date);
        this.journalLinesSubject$.next(
            this.journalLinesSubject$
                .getValue()
                .map(line => ({
                    ...line,
                    _isDirty: true,
                    FinancialDate: date,
                    VatDate: date,
                    RegisteredDate: date
                }))
        );
    }

    //#region IncomingBalanceLine CRUD

    public createOrUpdate(balanceLine: IIncomingBalanceLine) {
        return this.date$
            .pipe(
                take(1),
                map(date => ({
                    ...balanceLine,
                    _isDirty: true,
                    JournalEntryTypeID: JournalEntryTypes.IncomingBalance,
                    AccountID: balanceLine.Account?.ID,
                    SubAccountID: balanceLine.SubAccount?.ID,
                    FinancialDate: date,
                    RegisteredDate: date,
                    VatDate: date,
                    AmountCurrency: 0,
                })),
                switchMap(line => (line.ID || line._balanceGuid)
                    ? this.update(line)
                    : this.create(line)
                )
            );
    }

    public remove(forRemoval: IIncomingBalanceLine): Observable<boolean> {
        if (forRemoval['_isEmpty']) {
            return of(true);
        }
        if (forRemoval.ID) {
            return this
                .update({
                    ...forRemoval,
                    Deleted: true,
                    _isDirty: true
                })
                .pipe(
                    map(() => true),
                );
        } else {
            return this.allJournalLines$
                .pipe(
                    take(1),
                    map(lines => lines.filter(line => line._balanceGuid !== forRemoval._balanceGuid)),
                    tap(lines => this.journalLinesSubject$.next(lines)),
                    map(() => true)
                );
        }

    }

    public getLinesFromSource(source: IncomingBalanceLineSource) {
        return this.journalLines$.pipe(
            map(lines => lines.filter(line => line._source === source)),
        );
    }

    //#endregion

    public saveDraftAndFetchData() {
        this.isSavingSubject$.next(true);
        return this.saveDraft()
            .pipe(
                switchMap(() => this.fetchData()),
                finalize(() => this.isSavingSubject$.next(false)),
            );
    }

    public bookAndFetchData() {
        this.isSavingSubject$.next(true);
        return this.book()
            .pipe(
                switchMap(() => this.fetchData()),
                finalize(() => this.isSavingSubject$.next(false)),
            );
    }

    public unlockAndFetchData() {
        this.isSavingSubject$.next(true);
        return this.unlock()
            .pipe(
                switchMap(() => this.fetchData()),
                finalize(() => this.isSavingSubject$.next(false)),
            );
    }

    public getAccount(type: IncomingBalanceSubAccount, subAccount: Account): Observable<IIncomingBalanceMainAccountInfo> {
        if (!subAccount) {
            return of(null);
        }
        return this.getAccounts(type)
            .pipe(
                take(1),
                map(mainAccounts => mainAccounts
                    .accounts
                    .find(acc =>
                        !acc.fromNumber && !acc.toNumber
                        || (acc.fromNumber <= subAccount.AccountNumber && acc.toNumber >= subAccount.AccountNumber))
                    ),
            );
    }

    public getAccounts(type: IncomingBalanceSubAccount): Observable<IIncomingBalanceMainAccount> {
        return this.mainAccounts$
            .pipe(
                map(mainAccounts => mainAccounts.find(number => number.type === type)),
            );
    }

    public getAccountNumbers(type: IncomingBalanceSubAccount): Observable<number[]> {
        return this.getAccounts(type)
            .pipe(
                map(mainAccount => mainAccount?.accounts?.map(account => account.account?.AccountNumber) || []),
            );
    }

    private book() {
        return this.handleNonBookableLines()
            .pipe(
                switchMap(() => combineLatest(
                    [
                        this.journalEntry$,
                        this.allJournalLines$
                    ]
                )),
                take(1),
                switchMap(([journalEntry, draftLines]) => this.httpService.book({
                    ...journalEntry,
                    DraftLines: this.removeNonBookableLines(
                        draftLines
                            .filter(line => !line.Deleted)
                            .map(line => ({
                                ...line,
                                StatusCode: null
                            }))
                    )
                })),
            );
    }

    private unlock() {
        return this.journalEntry$
            .pipe(
                take(1),
                switchMap(journalEntry => this.httpService.credit(journalEntry)),
                switchMap(() => this.journalLines$),
                take(1),
                switchMap((lines) => {
                    const cleanLines = lines
                        .map(line => ({
                            ...line,
                            ID: 0,
                            _isDirty: true,
                            JournalEntryID: null,
                            JournalEntryNumber: null,
                            JournalEntryNumberNumeric: null,
                            StatusCode: null,
                        }));
                    return this.saveChangesAsDraft(null, cleanLines);
                }),
            );
    }

    private removeNonBookableLines(lines: IIncomingBalanceLine[]) {
        const mainAccounts = lines.filter(line => !!line.SubAccountID).map(line => line.AccountID);
        return lines
            .filter(line => (!mainAccounts.includes(line.AccountID) || line.SubAccountID) && !line.Deleted);
    }

    private getNonBookableLines(lines: IIncomingBalanceLine[]) {
        const mainAccounts = lines.filter(line => !!line.SubAccountID).map(line => line.AccountID);
        return lines
            .filter(line => (mainAccounts.includes(line.AccountID) && !line.SubAccountID) || line.Deleted);
    }

    private saveDraft() {
        return combineLatest(
            [
                this.journalEntry$,
                this.allJournalLines$,
            ]
        )
        .pipe(
            take(1),
            switchMap(([journalEntry, lines]) => this.saveChangesAsDraft(journalEntry, lines)),
        );
    }

    private handleNonBookableLines() {
        return this.allJournalLines$
            .pipe(
                take(1),
                map(lines => this.getNonBookableLines(lines)),
                switchMap(lines => combineLatest([
                    this.journalEntry$,
                    of(lines),
                ])),
                take(1),
                switchMap(([journalEntry, lines]) => this.saveChangesAsDraft(journalEntry, lines)),
            );
    }

    private saveChangesAsDraft(journalEntry: JournalEntry, lines: IIncomingBalanceLine[]) {
        return this.httpService
            .saveDraft(
                lines.filter(line => line._isDirty),
                journalEntry,
            );
    }

    private fetchData() {
        return this.httpService
            .getJournalData()
            .pipe(
                tap(journalEntry => {
                    const lines: IIncomingBalanceLine[] = this.reCreateMainAccountsIfMissing(
                            <IIncomingBalanceLine[]>journalEntry?.DraftLines || []
                        )
                        .map((line: any) => ({...line, _source: this.getSource(line)})) || [];
                    this.dateSubject$.next(lines[0]?.FinancialDate || new LocalDate());
                    this.journalLinesSubject$.next(lines);
                    if (journalEntry) {
                        this.journalEntrySubject$.next({...journalEntry, Lines: [], DraftLines: []});
                    } else {
                        this.journalEntrySubject$.next(null);
                    }
                }),
            );
    }

    private reCreateMainAccountsIfMissing(lines: IIncomingBalanceLine[]) {
        const mainAccounts = lines
            .filter((line) => !!line.SubAccountID)
            .map(line => line.AccountID);
        const extraLines: IIncomingBalanceLine[] = [];
        mainAccounts
            .forEach(accountID => {
                if (extraLines.some(line => line.AccountID === accountID)) {
                    return;
                }
                if (lines.filter(line => !line.SubAccountID).some(line => line.AccountID === accountID)) {
                    return;
                }
                const sum = lines
                    .filter(line => line.AccountID === accountID && line.SubAccountID)
                    .reduce((acc, line) => acc + line.Amount, 0);
                extraLines.push({
                    ...lines.find(line => line.AccountID === accountID),
                    SubAccountID:  null,
                    SubAccount: null,
                    Amount: sum,
                    AmountCurrency: 0,
                    InvoiceNumber: null,
                    ID: 0,
                    _balanceGuid: this.httpService.getNewGuid(),
                    _source: 'Balance'
                });
            });
        return [...lines, ...extraLines];
    }

    private setMainAccounts() {
        return this.httpService
            .getMainAccounts()
            .pipe(
                tap(mainAccounts => this.mainAccountsSubject$.next(mainAccounts))
            );
    }

    private create(line: IIncomingBalanceLine) {
        return this.allJournalLines$
            .pipe(
                take(1),
                map(currentLines => [...currentLines, {...line, _balanceGuid: this.httpService.getNewGuid()}]),
                tap(lines => this.journalLinesSubject$.next(lines)),
            );
    }

    private update(line: IIncomingBalanceLine) {
        return this.allJournalLines$
            .pipe(
                take(1),
                map(currentLines => {
                    const index = currentLines
                        .findIndex(currentLine =>
                            (line._balanceGuid && currentLine._balanceGuid === line._balanceGuid)
                            || (line.ID && currentLine.ID === line.ID)
                        );
                    return [...currentLines.slice(0, index), line, ...currentLines.slice(index + 1, currentLines.length)];
                }),
                tap(lines => this.journalLinesSubject$.next(lines)),
            );
    }

    private getSource(line: IIncomingBalanceLine): IncomingBalanceLineSource {
        if (line.SubAccount?.CustomerID) {
            return 'Customer';
        }
        if (line.SubAccount?.SupplierID) {
            return 'Supplier';
        }
        return 'Balance';
    }
}
