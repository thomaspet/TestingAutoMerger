import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {SalaryBalance} from '../../../unientities';

@Injectable()
export class SalarybalanceService extends BizHttp<SalaryBalance> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = SalaryBalance.RelativeUrl;
        this.entityType = SalaryBalance.EntityType;
    }
    
}
