import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CompanySettings} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {RequestMethod} from "angular2/http";

export class CompanySettingsService extends BizHttp<CompanySettings> {
    
    constructor(http: UniHttp) {        
        super(http);       
        this.relativeURL = CompanySettings.relativeUrl;
        this.DefaultOrderBy = null;
    }
}