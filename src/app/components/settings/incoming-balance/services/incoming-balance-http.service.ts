import { Injectable } from '@angular/core';
import { JournalEntryTypes } from '@app/services/accounting/journal-entry-type.service';
import {
    AccountService, JournalEntryLineDraftService,
    JournalEntryService, NumberSeriesService,
} from '@app/services/services';
import { Account, JournalEntry, JournalEntryLineDraft, JournalEntryType, NumberSeries, StatusCodeJournalEntryLineDraft } from '@uni-entities';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { IIncomingBalanceLine } from './incoming-balance-store.service';

export interface IIncomingBalanceAccount extends Account {
    _name: string;
    _orgnumber: string;
}

export type IncomingBalanceRoute = 'existing' | 'existing-balance' | 'new';

export const IncomingBalanceSubAccounts = ['Customer', 'Supplier'] as const;
export type IncomingBalanceSubAccount = typeof IncomingBalanceSubAccounts[number];

export interface IIncomingBalanceMainAccount {
    type: IncomingBalanceSubAccount;
    accounts: IIncomingBalanceMainAccountInfo[];
}

export interface IIncomingBalanceMainAccountInfo {
    account: Account;
    fromNumber?: number;
    toNumber?: number;
}

@Injectable()
export class IncomingBalanceHttpService {

    constructor(
        private draftLineService: JournalEntryLineDraftService,
        private journalEntryService: JournalEntryService,
        private numberSeriesService: NumberSeriesService,
        private accountService: AccountService,
    ) { }

    public getNewGuid() {
        return this.draftLineService.getNewGuid();
    }

    public getJournalData() {
        return this.getJournalEntry();
    }

    public book(journalEntry: JournalEntry) {
        return this.journalEntryService
            .bookJournalEntries([journalEntry])
            .pipe(
                map(result => result[0]),
            );
    }

    public credit(journalEntry: JournalEntry) {
        return this.journalEntryService.creditJournalEntry(journalEntry.JournalEntryNumber);
    }

    public creditAndBook(journalEntry: JournalEntry, creditJournalEntryID: number) {
        return this.journalEntryService.creditAndBookCorrectedJournalEntries([journalEntry], creditJournalEntryID);
    }

    public saveDraft(lines: IIncomingBalanceLine[], journalEntry: JournalEntry): Observable<JournalEntry> {
        if (!lines.length) {
            return of(journalEntry);
        }
        lines.forEach(line => {
            if (line.ID) {
                return;
            }
            line._createguid = this.getNewGuid();
        });
        return (journalEntry
            ? of(journalEntry)
            : this.journalEntryService.GetNewEntity()
        )
        .pipe(
            map((journal: JournalEntry) => ({...journal, DraftLines: lines})),
            switchMap(journal => journal.ID
                ? this.journalEntryService.Put(journal.ID, journal)
                : this.journalEntryService.Post(journal)
            ),
        );
    }

    public getNumberSeries() {
        const numberSeriesFilter = IncomingBalanceSubAccounts
            .map(type => `NumberSeriesType.EntityType eq '${type}'`)
            .join(' or ');
        return this.numberSeriesService
            .GetAll(
                `filter=${numberSeriesFilter}&expand=MainAccount,NumberSeriesType`)
            .pipe(
                map((lines: NumberSeries[]) => lines),
            );
    }

    public searchRegularAccounts(searchValue: string): Observable<Account[]> {
        return this.accountService
            .GetAll(this.searchAccountQuery(searchValue));
    }

    public searchAccountsOnEntity(searchValue: string, entityType: IncomingBalanceSubAccount): Observable<IIncomingBalanceAccount[]> {
        return this.accountService
        .GetAll(this.searchAccountQuery(searchValue, entityType))
        .pipe(
            map((accounts: Account[]) => accounts.map(account => this.mapToIncomingBalanceAccount(account, entityType)))
        );
    }

    public getAccount(entityID: number, entityType: IncomingBalanceSubAccount): Observable<IIncomingBalanceAccount> {
        if (!entityID) {
            return of(null);
        }
        return this.accountService
            .GetAll(
                `filter=${entityType}ID eq ${entityID}` +
                `&expand=${entityType}.Info`
            )
            .pipe(
                map(result => this.mapToIncomingBalanceAccount(result[0], entityType)),
            );
    }

    public getMainAccounts(): Observable<IIncomingBalanceMainAccount[]> {
        return this.getNumberSeries()
            .pipe(
                map(numberSeries => this.mapToMainAccounts(numberSeries)),
                switchMap(mainAccounts => this.addDefaults(mainAccounts)),
            );
    }

    public getTypeFromBackend(): Observable<IncomingBalanceRoute> {
        return this.draftLineService
            .getNewestFromTypes([
                JournalEntryTypes.IncomingBalance,
                JournalEntryTypes.OpeningBalance,
            ])
            .pipe(
                map(line => {
                    const options: {type: Number, routeType: IncomingBalanceRoute}[] = [
                        {type: JournalEntryTypes.IncomingBalance, routeType: 'existing-balance'},
                        {type: JournalEntryTypes.OpeningBalance, routeType: null},
                    ];
                    return options.find(option => option.type === line?.JournalEntryTypeID)?.routeType;
                })
            );
    }

    private searchAccountQuery(searchValue, type?: IncomingBalanceSubAccount): string {
        let query = `filter=Visible eq 'true'`;
        if (type) {
            query += `  and (startswith(AccountNumber,'${searchValue}') or contains(${type}.Info.Name,'${searchValue}'))` +
                ` and ${type}ID ne 0 and ${type}ID ne null` +
            `&expand=${type}.Info`;
        } else {
            query += ` and (startswith(AccountNumber,'${searchValue}') or contains(AccountName,'${searchValue}'))` +
                ` and (CustomerID eq 0 or CustomerID eq null)` +
                ` and (SupplierID eq 0 or SupplierID eq null)`;
        }
        return query +
        `&top=50`;
    }

    //#region fetch data

    private addDefaults(mainAccounts: IIncomingBalanceMainAccount[]): Observable<IIncomingBalanceMainAccount[]> {
        const defaults: {name: IncomingBalanceSubAccount, value: number}[] = [
            {name: 'Customer', value: 1500},
            {name: 'Supplier', value: 2400},
        ];
        return this.getDefaults(defaults)
            .pipe(
                map(defaultMainAccounts => [...mainAccounts, ...defaultMainAccounts]),
            );
    }

    private getDefaults(defaults: {name: IncomingBalanceSubAccount, value: number}[]): Observable<IIncomingBalanceMainAccount[]> {
        if (!defaults?.length) {
            return of([]);
        }
        return this.accountService
            .GetAll(`filter=${defaults.map(d => `AccountNumber eq ${d.value}`).join(' or ')}`)
            .pipe(
                map(accounts => this.mapToDefault(defaults, accounts)),
            );
    }

    private addMainAccountLines(lines: IIncomingBalanceLine[]) {
        const mainAccoutnLines = lines
            .filter(line => !!line.SubAccountID)
            .reduce((acc: IIncomingBalanceLine[], curr) => {
                const element = acc.find(line => line.AccountID === curr.AccountID);
                if (element) {
                    element.Amount += curr.Amount;
                } else {
                    acc.push({...curr, _source: 'Balance', SubAccount: null, SubAccountID: null});
                }
                return acc;
            }, []);
        return [...lines, ...mainAccoutnLines];
    }

    private getJournalEntry(): Observable<JournalEntry> {
        return this.journalEntryService
            .GetAll(
                `filter=DraftLines.JournalEntryTypeID eq ${JournalEntryTypes.IncomingBalance}` +
                `&expand=DraftLines.Account,DraftLines.SubAccount.Customer.Info,DraftLines.SubAccount.Supplier.Info` +
                `&top=1` +
                `&orderby=CreatedAt desc`
            )
            .pipe(
                map(journalEntries => journalEntries[0]),
                map((journalEntry: JournalEntry) => {
                    if (journalEntry?.DraftLines.some(lines => lines.StatusCode === StatusCodeJournalEntryLineDraft.Credited)) {
                        return null;
                    }
                    return journalEntry;
                }),
                map((journalEntry: JournalEntry) => {
                    if (journalEntry?.DraftLines?.some(line => line.StatusCode === StatusCodeJournalEntryLineDraft.Journaled)) {
                        journalEntry.DraftLines = journalEntry
                            .DraftLines
                            .map((line: IIncomingBalanceLine) => ({...line, _booked: true}));
                    }
                    return journalEntry;
                }),
            );
    }

    //#endregion

    //#region mapping
    private mapToMainAccounts(series: NumberSeries[]): IIncomingBalanceMainAccount[] {
        return IncomingBalanceSubAccounts
            .map(
                type => ({
                    type: type,
                    accounts: series
                        .filter(s => s.NumberSeriesType.EntityType === type)
                        .map(serie => ({
                            account: serie.MainAccount,
                            fromNumber: serie.FromNumber,
                            toNumber: serie.ToNumber,
                        }))
                })
            )
            .filter(mainAccount => mainAccount.accounts.length);
    }

    private mapToDefault(defaults: {name: IncomingBalanceSubAccount, value: number}[], accounts: Account[]): IIncomingBalanceMainAccount[] {
        return defaults.map(def => ({
            type: def.name,
            accounts: [
                {
                    account: accounts.find(a => a.AccountNumber === def.value),
                }
            ]
        }));
    }

    private mapToIncomingBalanceAccount(account: Account, type: IncomingBalanceSubAccount): IIncomingBalanceAccount {
        if (!account) {
            return null;
        }
        return {
            ...account,
            _name: account[type]?.Info?.Name,
            _orgnumber: account[type]?.OrgNumber,
        };
    }
    //#endregion
}
