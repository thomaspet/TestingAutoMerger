import {Injectable} from '@angular/core';
import {AccountService} from '@app/services/accounting/accountService';
import {Observable, of} from 'rxjs';
import {StatusCode} from '@app/components/sales/salesHelper/salesEnums';
import {map, switchMap} from 'rxjs/operators';
import {NumberSeriesService} from '@app/services/common/numberSeriesService';
import {FinancialYearService} from '@app/services/accounting/financialYearService';
import {JournalEntryService} from '@app/services/accounting/journalEntryService';

@Injectable()
export class OpeningBalanceService {
    constructor(
        private accountService: AccountService,
        private numberSeriesService: NumberSeriesService,
        private financialYearService: FinancialYearService,
        private journalEntryService: JournalEntryService
    ) {
    }

    accountSearch(searchValue: string): Observable<any> {
        return this.accountService.searchPublicAccounts(searchValue);
    }

    getAccount(accountID: number) {
        if (!accountID) {
            return of([]);
        }
        return this.accountService.Get(accountID).pipe(
            map(account => [account])
        );
    }

    getOpeningBalanceAccounts() {
        const accountNumbers = [1920, 2000, 2020, 2036, 2960];
        const filter = accountNumbers
            .map(accountNumber => `(Account.AccountNumber eq ${accountNumber})`)
            .join(' or ');
        return this.accountService.searchAccounts(`(${filter})`);
    }

    getActiveFinancialYear() {
        return this.financialYearService.getActiveFinancialYear();
    }

    getGeneralNumberSeriesTaskData() {
        const currentFinancialYear = this.getActiveFinancialYear();
        return this.numberSeriesService.getActiveNumberSeries('JournalEntry', currentFinancialYear.Year).pipe(
            map(numberSeries => {
                const generalNS = numberSeries.filter(ns => ns.NumberSeriesTaskID === 1);
                if (generalNS.length > 1) {
                    return generalNS.find(ns => ns.IsDefaultForTask);
                } else if (generalNS.length === 1) {
                    return generalNS[0];
                } else {
                    throw new Error('It was impossible to find a NumberSerie');
                }
            })
        );
    }

    saveAndPost(journalEntry) {
        return this.journalEntryService.bookJournalEntries([journalEntry]);
    }
}
