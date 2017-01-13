import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {PeriodSeries} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class PeriodSeriesService extends BizHttp<PeriodSeries> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = PeriodSeries.RelativeUrl;
        this.entityType = PeriodSeries.EntityType;
        this.DefaultOrderBy = null;
    }       
}
