import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CompanySettings} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {RequestMethod} from '@angular/http';

@Injectable()
export class CompanySettingsService extends BizHttp<CompanySettings> {
    
    constructor(http: UniHttp) {        
        super(http);       
        this.relativeURL = CompanySettings.RelativeUrl;
        this.entityType = CompanySettings.EntityType;
        this.DefaultOrderBy = null;
    }
}
