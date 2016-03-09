import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {WageType} from '../../../unientities';

export class WageTypeService extends BizHttp<WageType> {

    constructor(http:UniHttp) {
        super(http);
        this.relativeURL = WageType.relativeUrl;
    }

}