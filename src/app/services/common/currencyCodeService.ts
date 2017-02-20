import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CurrencyCode} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class CurrencyCodeService extends BizHttp<CurrencyCode> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = CurrencyCode.RelativeUrl;
        this.entityType = CurrencyCode.EntityType;
        this.DefaultOrderBy = null;
    }
}
