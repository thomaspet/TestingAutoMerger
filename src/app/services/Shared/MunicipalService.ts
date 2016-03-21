import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {Municipal} from '../../unientities';

export class MunicipalService extends BizHttp<Municipal> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = Municipal.relativeUrl;
    }
}
