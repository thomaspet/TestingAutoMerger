import {Injectable} from '@angular/core';
import {UniEntity, Account, StatusCodeProduct} from '../../../unientities';
import {Observable, of as observableOf} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import {StatisticsService} from '../statisticsService';
import {ErrorService} from '../errorService';
import {IUniSearchConfig} from '../../../../framework/ui/unisearch/index';
import {AccountService} from '../../accounting/accountService';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {catchError, map} from 'rxjs/operators';
import {ProductService} from '@app/services/common/productService';

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
        private productService: ProductService,
        private errorService: ErrorService,
        private browserStorageService: BrowserStorageService,
    ) {}

    public generateOnlyMainAccountsConfig(
        expands: string[] = <string[]>[],
        createNewFn?: () => Observable<UniEntity>,
        placeholder: string = ''
    ): IUniSearchConfig {
        return this.generateAccountsConfig(expands, createNewFn, false, placeholder);
    }

    public generateAllAccountsConfig(
        expands: string[] = <string[]>[],
        createNewFn?: () => Observable<UniEntity>
    ): IUniSearchConfig {
        return this.generateAccountsConfig(expands, createNewFn, true);
    }

    private generateAccountsConfig(
        expands: string[] = <string[]>[],
        createNewFn?: () => Observable<UniEntity>,
        all: boolean = false,
        placeholder: string = ''
    ): IUniSearchConfig {
        return <IUniSearchConfig>{
            lookupFn: searchTerm => {
                return this
                .statisticsService
                .GetAllUnwrapped(this.generateAccountsStatisticsQuery(searchTerm, all))
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            },
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
            tableHeader: ['Kontonummer', 'Kontonavn'],
            rowTemplateFn: item => [
                item.AccountNumber,
                item.AccountName
            ],
            placeholder: placeholder,
            inputTemplateFn: item => `${item.AccountNumber} - ${item.AccountName}`,
            createNewFn: createNewFn,
            maxResultsLength: MAX_RESULTS
        };
    }

    // function made for accrualModal to search for 1700's accounts if search is empty, searches for input otherwise
    public generate17XXAccountsConfig(

        all: boolean = false,
        expands: string[] = [],
        createNewFn?: () => Observable<UniEntity>,
        accountID?: number
    ): IUniSearchConfig {
        return <IUniSearchConfig>{

            lookupFn: searchTerm => this.statisticsService
                .GetAllUnwrapped(accountID ? this.getSimpleQuery(accountID) : this.generate17XXAccountsStatisticsQuery(searchTerm, all))
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            onSelect: (selectedItem: CustomStatisticsResultItem) => {
                // saving to localStorage to have last selected search be stored and used in accrualModal
                // to get initial data in that field
                if(selectedItem.ID && selectedItem.AccountNumber) {
                    this.browserStorageService.setItem('BalanceAccountID', selectedItem.ID);
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
            inputTemplateFn: item => `${item.AccountNumber} - ${item.AccountName}`,
            createNewFn: createNewFn,
            maxResultsLength: MAX_RESULTS
        };
    }

    getSimpleQuery(ID: number) {
        return `model=Account&filter=ID eq ${ID}&select=Account.ID as ID,Account.AccountNumber as AccountNumber,Account.AccountName as AccountName&top=1`;
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

    public generateProductsConfig(createNewFn?: () => Observable<UniEntity>): IUniSearchConfig {
        const productExpand = [
            'Account',
            'Account.MandatoryDimensions',
            'Dimensions.Info',
            'Dimensions.Project',
            'Dimensions.Department'
        ];
        return <IUniSearchConfig>{
            lookupFn: (input: string) => {
                let filter = `statuscode eq '${StatusCodeProduct.Active}' and (contains(Name,'${input}') or startswith(PartName,'${input}'))`;

                // Search for specific PartName with prefix =
                if (input && input.charAt(0) === '=') {
                    const searchText = input.split('=')[1];
                    if (searchText) {
                        filter = `PartName eq '${searchText.trim()}'`;
                    }
                }

                return this.productService.GetAll(
                    `filter=${filter}&top=100&orderby=PartName`, productExpand).pipe(
                    catchError(err => {
                        this.errorService.handle(err);
                        return observableOf([]);
                    }),
                    map(res => {
                        const sorted = (res || []).sort((item1, item2) => {
                            const item1PartName = item1.PartName || '';
                            const item2PartName = item2.PartName || '';

                            if (+item1PartName && +item2PartName) {
                                return +item1PartName - +item2PartName;
                            }

                            return item1PartName.localeCompare(item2PartName);
                        });

                        return sorted;
                    })
                );
            },
            onSelect: (selectedItem: CustomStatisticsResultItem) => {
                if (selectedItem.ID) {
                    return this.productService.Get(selectedItem.ID, productExpand)
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                } else {
                    return this.productService.Post(selectedItem)
                        .switchMap(item => this.productService.Get(selectedItem.ID, productExpand))
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                }
            },
            initialItem$: new BehaviorSubject(null),
            tableHeader: ['Nr', 'Navn', 'Pris'],
            rowTemplateFn: item => [
                item.PartName,
                item.Name,
                item.PriceIncVat
            ],
            inputTemplateFn: item => item.Name ? `${item.PartName} - ${item.Name}` : item.PartName,
            createNewFn: createNewFn,
            maxResultsLength: MAX_RESULTS
        };
    }
}
