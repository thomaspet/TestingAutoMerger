import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {Employment} from '../../../unientities';

export class EmploymentService extends BizHttp<Employment> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = Employment.relativeUrl;
    }
    
    public getNewEntity(){
        this.relativeURL = 'employment';
        var response = this.GetNewEntity();
        this.relativeURL = Employment.relativeUrl;
        return response;
    }

}
