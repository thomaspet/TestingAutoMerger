import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CompanySettings} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';

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
            'BankAccounts.Bank',
            'BankAccounts.Account',
            'CompanyBankAccount.Account',
            'TaxBankAccount',
            'SalaryBankAccount',
            'DefaultSalesAccount',
            'BaseCurrencyCode',
            'Distributions',
            'FactoringEmail',
            'CustomerInvoiceReminderSettings.CustomerInvoiceReminderRules',
            'CustomerInvoiceReminderSettings.DebtCollectionSettings.DebtCollectionAutomation',
        ];
    }

    public getCompanySettings(expand?: string[]): Observable<CompanySettings> {
        return super.GetAll('top=1', expand).map(res => res[0]);
    }

    public getFilledInCompanySettingsFromBrreg(orgNumber: string): Observable<CompanySettings> {
        return super.GetAction(null, 'fill-in-from-brreg', `orgNumber=${orgNumber}`);
    }

    public changeCompanySettingsPeriodSeriesSettings(periodSeriesID: number, accountYear: number) {
        super.invalidateCache();
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}?action=change-period-series&periodSeriesID=${periodSeriesID}&accountYear=${accountYear}`)
            .send()
            .map(response => response.body);
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
