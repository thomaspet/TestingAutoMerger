import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CompanySettings} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class CompanySettingsService extends BizHttp<CompanySettings> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = CompanySettings.RelativeUrl;
        this.entityType = CompanySettings.EntityType;
        this.DefaultOrderBy = null;
        this.defaultExpand = [
            'DefaultAddress',
            'DefaultEmail',
            'DefaultPhone',
            'BankAccounts',
            'BankAccounts.Bank',
            'BankAccounts.Account',
            'CompanyBankAccount',
            'CompanyBankAccount.Account',
            'TaxBankAccount',
            'SalaryBankAccount',
            'DefaultSalesAccount',
            'BaseCurrencyCode'
        ];
    }

    public getCompanySettings(expand?: string[]) {
        return super.GetAll('top=1', expand).map(res => res[0]);
    }
}
