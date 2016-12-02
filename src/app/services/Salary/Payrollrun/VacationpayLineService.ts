import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {VacationPayLine} from '../../../unientities';

@Injectable()
export class VacationpayLineService extends BizHttp<VacationPayLine> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = VacationPayLine.RelativeUrl;
        this.entityType = VacationPayLine.EntityType;
    }

}
