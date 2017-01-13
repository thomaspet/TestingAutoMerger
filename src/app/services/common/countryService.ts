import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Country} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class CountryService extends BizHttp<Country> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = Country.RelativeUrl;
        this.entityType = Country.EntityType;
        this.DefaultOrderBy = null;
    }
}
