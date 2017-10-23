import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CompanySettings} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';

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

    public getFilledInCompanySettingsFromBrreg(orgNumber: string) {
        return super.GetAction(null, 'fill-in-from-brreg', `orgNumber=${orgNumber}`);
    }

    public fillInCompanySettings(
        companySettings: CompanySettings,
        brreg: CompanySettings): CompanySettings {

        companySettings.DefaultAddress = brreg.DefaultAddress;
        companySettings.DefaultAddressID = brreg.DefaultAddressID;
        companySettings.OfficeMunicipalityNo = brreg.OfficeMunicipalityNo;
        companySettings.CompanyName = brreg.CompanyName;
        return companySettings;
    }
}
