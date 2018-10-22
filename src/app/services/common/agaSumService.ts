import { Injectable } from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {AGASums, FreeAmountSummary} from '../../unientities';
import {Observable} from 'rxjs';

@Injectable()
export class AgaSumService extends BizHttp<AGASums> {

    constructor(protected http: UniHttp) {
        super(http);
        this.relativeURL = 'agasums';
    }

    public getFreeAmountSummary(): Observable<FreeAmountSummary> {
        return super.GetAction(null, 'free-amount-summary');
    }
}
