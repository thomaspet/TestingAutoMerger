import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {NumberSeriesType} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class NumberSeriesTypeService extends BizHttp<NumberSeriesType> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = NumberSeriesType.RelativeUrl;
        this.entityType = NumberSeriesType.EntityType;
        this.DefaultOrderBy = null;
    }
}
