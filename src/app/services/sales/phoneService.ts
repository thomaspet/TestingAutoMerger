import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Phone} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class PhoneService extends BizHttp<Phone> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = 'phones'; //TODO: missing Phone.RelativeUrl;
        this.entityType = Phone.EntityType;
        this.DefaultOrderBy = null;
    }
}
