import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {VatReportForm} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class VatReportFormService extends BizHttp<VatReportForm> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = VatReportForm.RelativeUrl;
        this.entityType = VatReportForm.EntityType;
        this.DefaultOrderBy = null;
    }       
}
