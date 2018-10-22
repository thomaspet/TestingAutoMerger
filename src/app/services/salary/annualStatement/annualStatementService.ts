import {Injectable} from '@angular/core';
import {RequestMethod} from '@angular/http';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {AnnualStatement, Employee} from '../../../unientities';
import {Observable} from 'rxjs';

@Injectable()
export class AnnualStatementService extends BizHttp<AnnualStatement> {

    constructor(protected http: UniHttp) {
        super(http);
        this.relativeURL = 'annual-statement';
    }

    public sendMail(emps: Employee[], year: number = 0): Observable<boolean> {
        return super.ActionWithBody(null, emps, 'email', RequestMethod.Put, `year=${year}`);
    }
}
