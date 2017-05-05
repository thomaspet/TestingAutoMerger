import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {VacationPayLine, VacationPayList, VacationPayInfo} from '../../../unientities';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class VacationpayLineService extends BizHttp<VacationPayLine> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = VacationPayLine.RelativeUrl;
        this.entityType = VacationPayLine.EntityType;
    }

    public getVacationpayBasis(year: number, payrun: number): Observable<VacationPayList> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `?action=vacationpaylist&payrunID=${payrun}&year=${year}`)
            .send()
            .map(response => response.json());
    }

    public createVacationPay(year: number, payrun: number, payList: VacationPayInfo[]) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `?action=vacationpay-infolist&payrollID=${payrun}&year=${year}`)
            .withBody(payList)
            .send();
    }

}
