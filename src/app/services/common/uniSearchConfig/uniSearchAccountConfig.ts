import {Injectable} from '@angular/core';
import {UniEntity, Account} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {StatisticsService} from '../statisticsService';
import {ErrorService} from '../errorService';
import {IUniSearchConfig} from '../../../../framework/ui/unisearch/index';
import {AccountService} from '../../accounting/accountService';
import {BrowserStorageService} from '../browserStorageService';

const MAX_RESULTS = 50;

class CustomStatisticsResultItem {
    /* tslint:disable */
    public ID: number;
    public AccountNumber: number;
    public AccountName: string;
}

@Injectable()
export class UniSearchAccountConfig {

    constructor(
        private statisticsService: StatisticsService,
        private accountService: AccountService,
        private errorService: ErrorService,
        private browserStorageService: BrowserStorageService
    ) {}

    public generateOnlyMainAccountsConfig(
        expands: string[] = <string[]>[],
        newItemModalFn?: () => Observable<UniEntity>
    ): IUniSearchConfig {
        return this.generateAccountsConfig(expands, newItemModalFn, false);
    }

    public generateAllAccountsConfig(
        expands: string[] = <string[]>[],
        newItemModalFn?: () => Observable<UniEntity>
    ): IUniSearchConfig {
        return this.generateAccountsConfig(expands, newItemModalFn, true);
    }

    private generateAccountsConfig(
        expands: string[] = <string[]>[],
        newItemModalFn?: () => Observable<UniEntity>,
        all: boolean = false
    ): IUniSearchConfig {
        return <IUniSearchConfig>{
            lookupFn: searchTerm => this
                .statisticsService
                .GetAllUnwrapped(this.generateAccountsStatisticsQuery(searchTerm, all))
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            onSelect: (selectedItem: CustomStatisticsResultItem) => {
                if (selectedItem.ID) {
                    return this.accountService.Get(selectedItem.ID, expands)
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                } else {
                    return this.accountService.Post(this.customStatisticsObjToAccount(selectedItem))
                        .switchMap(item => this.accountService.Get(item.ID, expands))
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                }
            },
            initialItem$: new BehaviorSubject(null),
            tableHeader: ['Konto nr.', 'Konto navn'],
            rowTemplateFn: item => [
                item.AccountNumber,
                item.AccountName
            ],
            inputTemplateFn: item =>
                `${item.AccountNumber} - ${item.AccountName}`,
            newItemModalFn: newItemModalFn,
            maxResultsLength: MAX_RESULTS
        };
    }

    // function made for accrualModal to search for 1700's accounts if search is empty, searches for input otherwise
    public generate17XXAccountsConfig(

        all: boolean = false,
        expands: string[] = [],
        newItemModalFn?: () => Observable<UniEntity>
    ): IUniSearchConfig {
        return <IUniSearchConfig>{

            lookupFn: searchTerm => this.statisticsService
                .GetAllUnwrapped(this.generate17XXAccountsStatisticsQuery(searchTerm, all))
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            onSelect: (selectedItem: CustomStatisticsResultItem) => {
                // saving to localStorage to have last selected search be stored and used in accrualModal
                // to get initial data in that field
                if(selectedItem.ID && selectedItem.AccountNumber) {
                    this.browserStorageService.save('BalanceAccountID', JSON.stringify(selectedItem.ID));
                }
                if (selectedItem.ID) {
                    return this.accountService.Get(selectedItem.ID, expands)
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                } else {
                    return this.accountService.Post(this.customStatisticsObjToAccount(selectedItem))
                        .switchMap(item => this.accountService.Get(item.ID, expands))
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                }
            },
            initialItem$: new BehaviorSubject(null),
            tableHeader: ['Konto nr.', 'Konto navn'],
            rowTemplateFn: item => [
                item.AccountNumber,
                item.AccountName
            ],
            inputTemplateFn: item =>
                `${item.AccountNumber} - ${item.AccountName}`,
            newItemModalFn: newItemModalFn,
            maxResultsLength: MAX_RESULTS
        };
    }

    // made for accrualModal
    public generate17XXAccountsStatisticsQuery(searchTerm: string, all: boolean = false): string {
      const model = 'Account';
      const isEmptySearch = !searchTerm;
      const startNumber = this.getNumberFromStartOfString(searchTerm);
      const filter = `(Account.Visible eq 1) and ` + ( isEmptySearch
          ? `startswith(Account.AccountNumber,'17')`
          : startNumber ? `startswith(Account.AccountNumber,'${searchTerm}')` : `contains(Account.AccountName,'${searchTerm}')`)
          + (all ? '' : ' and isnull(Account.AccountID,0) eq 0');
      const select = [
          'Account.ID as ID',
          'Account.AccountNumber as AccountNumber',
          'Account.AccountName as AccountName'
      ].join(',');
      const orderBy = 'AccountNumber';
      const skip = 0;
      const top = MAX_RESULTS;
      return `model=${model}`
          + `&filter=${filter}`
          + `&select=${select}`
          + `&orderby=${orderBy}`
          + `&skip=${skip}`
          + `&top=${top}`;
    }

    private generateAccountsStatisticsQuery(searchTerm: string, all: boolean = false): string {
        const model = 'Account';
        const startNumber = this.getNumberFromStartOfString(searchTerm);
        const filter = `(Account.Visible eq 1) and ` + ( startNumber
            ? `startswith(Account.AccountNumber,'${startNumber}')`
            : `contains(Account.AccountName,'${searchTerm}')` )
            + (all ? '' : ' and isnull(Account.AccountID,0) eq 0');
        const select = [
            'Account.ID as ID',
            'Account.AccountNumber as AccountNumber',
            'Account.AccountName as AccountName'
        ].join(',');
        const orderBy = 'AccountNumber';
        const skip = 0;
        const top = MAX_RESULTS;
        return `model=${model}`
            + `&filter=${filter}`
            + `&select=${select}`
            + `&orderby=${orderBy}`
            + `&skip=${skip}`
            + `&top=${top}`;
    }

    private customStatisticsObjToAccount(statObj: CustomStatisticsResultItem): Account {
        const account = new Account();
        account.AccountName = statObj.AccountName;
        account.AccountNumber = statObj.AccountNumber;
        return account;
    }

    private getNumberFromStartOfString(str: string): number {
        const match = str.match(/^\d+/);
        return match && +match[0];
    }
}
