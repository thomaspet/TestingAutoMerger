import {Injectable} from '@angular/core';
import {AccountService} from '@app/services/accounting/accountService';
import {AssetsService} from '@app/services/common/assetsService';
import {ProjectService} from '@app/services/common/projectService';
import {DepartmentService} from '@app/services/common/departmentService';
import {forkJoin, Observable, of} from 'rxjs';
import {StatusCode} from '@app/components/sales/salesHelper/salesEnums';
import {map, take} from 'rxjs/operators';
import {StatisticsService} from '@app/services/common/statisticsService';

@Injectable()
export class AssetDetailFormConfigBuilder {
    static self: AssetDetailFormConfigBuilder;
    constructor(
        private accountService: AccountService,
        private assetsService: AssetsService,
        private projectService: ProjectService,
        private departmentService: DepartmentService,
        private statistics: StatisticsService
    ) {
        AssetDetailFormConfigBuilder.self = this;
    }

    getProjectsAndDepartments() {
        return forkJoin([
            this.projectService.GetAll(),
            this.departmentService.GetAll()
        ]).pipe(take(1));
    }

    assetGroupSearch(searchValue: any = ''): Observable<any> {
        return AssetDetailFormConfigBuilder.self.assetsService.getAssetGroups(searchValue);
    }
    getAssetGroupByCode(code: string) {
        return AssetDetailFormConfigBuilder.self.assetsService.getAssetGroupByCode(code);
    }
    accountSearch(searchValue: string): Observable<any> {
        let filter = '';
        if (searchValue === '') {
            filter = `Visible eq 'true' and ( isnull(AccountID,0) eq 0 ) ` +
                `or ( ( isnull(AccountID,0) eq 0 ) ` +
                `and ((Customer.Statuscode ne ${StatusCode.InActive} and Customer.Statuscode ne ${StatusCode.Deleted} ) ` +
                `or ( Supplier.Statuscode ne ${StatusCode.InActive} and Supplier.Statuscode ne ${StatusCode.Error} and Supplier.Statuscode ne ${StatusCode.Deleted}) ))`;
        } else {
            filter = `( contains(keywords,'${searchValue}') ) or `;
            if (isNaN(parseInt(searchValue, 10))) {
                filter += `Visible eq 'true' and (contains(AccountName\,'${searchValue}') ` +
                    `and isnull(account.customerid,0) eq 0 and isnull(account.supplierid,0) eq 0) ` +
                    `or (contains(AccountName\,'${searchValue}') ` +
                    `and ((Customer.Statuscode ne ${StatusCode.InActive} and Customer.Statuscode ne ${StatusCode.Deleted}) ` +
                    `or (Supplier.Statuscode ne ${StatusCode.InActive} and Supplier.Statuscode ne ${StatusCode.Error} and Supplier.Statuscode ne ${StatusCode.Deleted}))) ` +
                    `or (Account.AccountName eq '${searchValue}' ` +
                    `and (Customer.Statuscode ne ${StatusCode.Deleted} or Supplier.Statuscode ne ${StatusCode.Deleted}))`;
            } else {
                filter += `Visible eq 'true' and ((startswith(AccountNumber\,'${parseInt(searchValue, 10)}') ` +
                    `or contains(AccountName\,'${searchValue}')  ) ` +
                    `and ( isnull(account.customerid,0) eq 0 and isnull(account.supplierid,0) eq 0 )) ` +
                    `or ((startswith(AccountNumber\,'${parseInt(searchValue, 10)}') or contains(AccountName\,'${searchValue}') ) ` +
                    `and ((Customer.Statuscode ne ${StatusCode.InActive} and Customer.Statuscode ne ${StatusCode.Deleted}) ` +
                    `or (Supplier.Statuscode ne ${StatusCode.InActive} and Supplier.Statuscode ne ${StatusCode.Error} and Supplier.Statuscode ne ${StatusCode.Deleted}))) ` +
                    `or (Account.AccountNumber eq '${parseInt(searchValue, 10)}' ` +
                    `and (Customer.Statuscode ne ${StatusCode.Deleted} or Supplier.Statuscode ne ${StatusCode.Deleted}))`;
            }
        }
        return this.accountService.searchAccounts(filter, searchValue !== '' ? 100 : 500);
    }
    balanceAccountSearch(searchValue: string): Observable<any> {
        return AssetDetailFormConfigBuilder.self.accountSearch(searchValue).pipe(
            map(accounts => accounts.filter(account => {
                return account.AccountNumber.toString().startsWith('10')
                || account.AccountNumber.toString().startsWith('11')
                || account.AccountNumber.toString().startsWith('12');
            }))
        );
    }
    getAccount(accountID: number) {
        if (!accountID) {
            return of([]);
        }
        return AssetDetailFormConfigBuilder.self.accountService.Get(accountID).pipe(
            map(account => [account])
        );
    }
    getProjectFromDimensionID(dimensionsID: number, projects) {
        if (!dimensionsID) {
            return of([]);
        }
        return this.statistics.GetAllUnwrapped(
            `model=Dimensions&select=Project.ID as ID&filter=Dimensions.ID eq ${dimensionsID}&expand=Project`
        ).pipe(map(data => [projects.find(x => data[0]?.ID === x?.ID)]));
    }
    getDepartmentFromDimensionID(dimensionsID: number, departments) {
        if (!dimensionsID) {
            return of([]);
        }
        return this.statistics.GetAllUnwrapped(
            `model=Dimensions&select=Department.ID as ID&filter=Dimensions.ID eq ${dimensionsID}&expand=Department`
        ).pipe(map(data => [departments.find(x => data[0]?.ID === x?.ID)]));
    }
}
