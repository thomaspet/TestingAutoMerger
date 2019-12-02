import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {tap, map} from 'rxjs/operators';
import {environment} from 'src/environments/environment';

import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Company, CompanySettings, Address} from '../../unientities';
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

    createCompany(
        companyName: string,
        companySettings: CompanySettings,
        contractID: number,
        productNames: string,
        isTemplate: boolean = false
    ) {
        return this.http
            .asPUT()
            .withEndPoint('companies?action=create-company')
            .withBody({
                CompanyName: companyName,
                CompanySettings: companySettings,
                ContractID: contractID,
                ProductNames: productNames,
                IsTemplate: isTemplate
            })
            .send()
            .map(response => {
                super.invalidateCache();
                return response.body;
            });
    }

    /**
     * @returns JobID that can be queried for progress
     */
    createFromTemplate(
        templateCompanyKey: string,
        companySettings: CompanySettings,
        productNames: string[],
        contractID: number
    ): Observable<number> {
        const address = companySettings.DefaultAddress || <Address> {};
        const body = {
            TemplateCompanyKey: templateCompanyKey,
            CompanyDetails: {
                ContractID: contractID,
                ProductNames: productNames,
                CompanyName: companySettings.CompanyName,
                OrganizationNumber: companySettings.OrganizationNumber,
                Address: address.AddressLine1,
                PostalCode: address.PostalCode,
                City: address.City,
            }
        };

        const endpoint = environment.UNI_JOB_SERVER_URL + 'jobs?job=ImportFromTemplate';
        return this.http.asPOST()
            .withBody(body)
            .sendToUrl(endpoint)
            .pipe(
                tap(() => super.invalidateCache()),
                map(jobID => +jobID)
            );
    }

    updateCompanyClientNumber(companyID: number, clientNumber: number, key) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(`companies/${companyID}?action=clientnumber&clientnumber=${clientNumber}`)
            .withHeader('CompanyKey', key)
            .send({}, null, false)
            .pipe(
                tap(() => super.invalidateCache()),
                map(res => res.body)
            );
    }

    deleteCompany(companyKey: string) {
        return this.http
            .asDELETE()
            .usingBusinessDomain()
            .withEndPoint(`companies?action=delete-company&key=${companyKey}`)
            .send({}, null, false)
            .do(() => super.invalidateCache());
    }

    restoreCompany(companyKey: string) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(`companies?action=undelete-company&key=${companyKey}`)
            .send({}, null, false)
            .do(() => super.invalidateCache());
    }
}
