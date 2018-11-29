import { Injectable } from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import { Accrual } from '../../unientities';

@Injectable()
export class AccrualService extends BizHttp<Accrual> {
    constructor(protected http: UniHttp) {
        super(http);
        this.relativeURL = 'accruals';
    }
}
