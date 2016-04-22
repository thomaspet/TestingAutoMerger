import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CompanySettings} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";
import {RequestMethod} from "angular2/http";

export class CompanySettingsService extends BizHttp<CompanySettings> {
    
    constructor(http: UniHttp) {        
        super(http);       
        this.relativeURL = CompanySettings.relativeUrl;
        this.DefaultOrderBy = null;
    }
    
    public getCompanyTypes() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('companytypes')
            .send();
    }

    public getCurrencies() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('currencies')
            .send();
    }

    public getPeriodSeries() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('period-series')
            .send();
    }

    public getAccountGroupSets() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('accountgroupsets')
            .send();
    }
    
    public getAccounts() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('accounts')
            .send();
    }
    
    public getSubEntities() {
        return this.http
            .asGET()
            .withEndPoint('subentities')
            .send({expand: 'BusinessRelationInfo,BusinessRelationInfo.InvoiceAddress'});
    }
      
    public getMunicipalities(filter: string) {
        return this.http
            .asGET()
            .withEndPoint('municipals')
            .send({filter: filter});
    }
}