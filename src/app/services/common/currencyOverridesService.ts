import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CurrencyOverride} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class CurrencyOverridesService extends BizHttp<CurrencyOverride> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = CurrencyOverride.RelativeUrl;
        this.entityType = CurrencyOverride.EntityType;
        this.DefaultOrderBy = null;
    }
}
