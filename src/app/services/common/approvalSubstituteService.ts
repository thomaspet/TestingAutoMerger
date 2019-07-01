import {Injectable} from '@angular/core';
import {ApprovalSubstitute} from '@uni-entities';
import {BizHttp} from '@uni-framework/core/http/BizHttp';
import {UniHttp} from '@uni-framework/core/http/http';
import {Observable} from 'rxjs';
import * as moment from 'moment';

@Injectable()
export class ApprovalSubstituteService extends BizHttp<ApprovalSubstitute> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = ApprovalSubstitute.RelativeUrl;
        this.defaultExpand = ['User', 'SubstituteUser'];
    }

    getActiveSubstitutes(): Observable<ApprovalSubstitute[]> {
        const today = moment().format('YYYY-MM-DD');
        const filter = `filter=FromDate le '${today}' and ToDate ge '${today}'`;
        return this.GetAll(filter);
    }
}
