import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Company, CompanySettings} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class CompanyService extends BizHttp<Company> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = Company.RelativeUrl;
        this.entityType = Company.EntityType;
        this.DefaultOrderBy = null;

        // Tell BizHttp to only clear cache on logout (not company change)
        this.cacheSettings.clearOnlyOnLogout = true;
    }

    createCompany(companyName: string, companySettings: CompanySettings, contractID: number, productNames: string) {
        return this.http
            .asPUT()
            .withEndPoint('companies?action=create-company')
            .withBody({
                CompanyName: companyName,
                CompanySettings: companySettings,
                ContractID: contractID,
                ProductNames: productNames
            })
            .send()
            .do(() => super.invalidateCache())
            .map(response => response.json());
    }

    public updateCompanyClientNumber(companyID: number, clientNumber: number, key) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(`companies/${companyID}?action=clientnumber&clientnumber=${clientNumber}`)
            .withHeader('CompanyKey', key)
            .send({}, null, false)
            .do(() => super.invalidateCache())
            .map(res => res.json());
    }

    deleteCompany(ID: number, companyKey: string) {
        return this.http
            .asDELETE()
            .usingBusinessDomain()
            .withEndPoint(`companies/${ID}?action=delete-company`)
            .withHeader('CompanyKey', companyKey)
            .send({}, null, false)
            .do(() => super.invalidateCache());
    }
}
