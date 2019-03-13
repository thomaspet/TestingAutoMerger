import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CompanyAccountingSettings} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class CompanyAccountingSettingsService extends BizHttp<CompanyAccountingSettings> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = CompanyAccountingSettings.RelativeUrl;
        this.entityType = CompanyAccountingSettings.EntityType;
    }


}
