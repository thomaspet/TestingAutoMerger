import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CompanySettings} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {AuthService} from '../../../framework/core/authService';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class CompanySettingsService extends BizHttp<CompanySettings> {

    constructor(http: UniHttp, authService: AuthService) {
        super(http, authService);
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
            'DefaultSalesAccount'
        ];
    }
}
