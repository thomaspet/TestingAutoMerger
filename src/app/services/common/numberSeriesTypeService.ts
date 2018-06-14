import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {NumberSeriesType} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class NumberSeriesTypeService extends BizHttp<NumberSeriesType> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = NumberSeriesType.RelativeUrl;
        this.entityType = NumberSeriesType.EntityType;
        this.DefaultOrderBy = null;
    }
    public save<T>(numberSeriesType: NumberSeriesType): Observable<NumberSeriesType> {
        let nst: NumberSeriesType = numberSeriesType;
        if (nst && nst.ID) {
            return this.Put(nst.ID, nst);
        }
        return this.Post(nst);
    }
}
