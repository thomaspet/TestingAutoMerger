import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {Employment} from '../../../unientities';

export class EmploymentService extends BizHttp<Employment> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = Employment.RelativeUrl;
    }

}
