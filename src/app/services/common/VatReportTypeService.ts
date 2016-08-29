import {BizHttp} from '../../../framework/core/http/BizHttp';
import {VatReportType} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class VatReportTypeService extends BizHttp<VatReportType> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = VatReportType.RelativeUrl;
        this.DefaultOrderBy = null;
    }       
}