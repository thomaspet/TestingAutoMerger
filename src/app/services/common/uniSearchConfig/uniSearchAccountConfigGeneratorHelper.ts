import {UniEntity, Account} from '../../../unientities';
import {Observable, BehaviorSubject} from 'rxjs/Rx';
import {StatisticsService} from '../statisticsService';
import {ErrorService} from '../errorService';
import {MAX_RESULTS} from './uniSearchConfigGeneratorService';
import {IUniSearchConfig} from 'unisearch-ng2/src/UniSearch/UniSearch';
import {AccountService} from '../../Accounting/accountService';
import {Injectable} from '@angular/core';

class CustomStatisticsResultItem {
    /* tslint:disable */
    public ID: number;
    public AccountNumber: number;
    public AccountName: string;
}

@Injectable()
export class UniSearchAccountConfigGeneratorHelper {

    constructor(
        private statisticsService: StatisticsService,
        private accountService: AccountService,
        private errorService: ErrorService
    ) {}

    public generateOnlyMainAccountsConfig(
        expands: [string] = <[string]>[],
        newItemModalFn?: () => Observable<UniEntity>
    ): IUniSearchConfig {
        return {
            lookupFn: searchTerm => this
                .statisticsService
                .GetAllUnwrapped(this.generateMainAccountsOnlyStatisticsQuery(searchTerm))
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            expandOrCreateFn: (newOrExistingItem: CustomStatisticsResultItem) => {
                if (newOrExistingItem.ID) {
                    return this.accountService.Get(newOrExistingItem.ID, expands)
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                } else {
                    return this.accountService.Post(this.customStatisticsObjToAccount(newOrExistingItem))
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

    private generateMainAccountsOnlyStatisticsQuery(searchTerm: string): string {
        const model = 'Account';
        const startNumber = this.getNumberFromStartOfString(searchTerm);
        const filter = ( startNumber
            ? `startswith(Account.AccountNumber,'${startNumber}')`
            : `contains(Account.AccountName,'${searchTerm}')` )
            + ' and isnull(Account.AccountID,0) eq 0';
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
