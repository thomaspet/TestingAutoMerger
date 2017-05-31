import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {VacationPayLine} from '../../../unientities';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class VacationpayLineService extends BizHttp<VacationPayLine> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = VacationPayLine.RelativeUrl;
        this.entityType = VacationPayLine.EntityType;
    }

    public getVacationpayBasis(year: number, payrun: number): Observable<VacationPayLine[]> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `?action=lines&payrunID=${payrun}&year=${year}`)
            .send()
            .map(response => response.json())
            .do(lines => console.log('response from vacationpaylist action: ', lines));
    }

    public createVacationPay(year: number, payrun: number, payList: VacationPayLine[]) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `?action=pay-fromlines&payrollID=${payrun}&year=${year}`)
            .withBody(payList)
            .send();
    }

}
