import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {CompanySalary} from '../../../unientities';
import {Observable} from 'rxjs';
export enum CompanySalaryBaseOptions {
    NettoPayment = 0,
    SpesialDeductionForMaritim = 1,
    Svalbard = 2,
    PayAsYouEarnTaxOnPensions = 3,
    JanMayenAndBiCountries = 4,
    NettoPaymentForMaritim = 6,
    TaxFreeOrganization = 7,
}
@Injectable()
export class CompanySalaryService extends BizHttp<CompanySalary> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = CompanySalary.RelativeUrl;
        this.entityType = CompanySalary.EntityType;
    }

    public getCompanySalary(): Observable<CompanySalary> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL)
            .send({top: 1})
            .map(response => response.body)
            .map(res => res[0]);
    }

    public getBaseOptions(compSal: CompanySalary): CompanySalaryBaseOptions[] {
        return Object
            .keys(CompanySalaryBaseOptions)
            .filter(key => compSal && compSal['Base_' + key])
            .map(key => CompanySalaryBaseOptions[key]);
    }

    public setBaseOptions(compSal: CompanySalary, baseOptions: CompanySalaryBaseOptions[]): CompanySalary {
        Object
            .keys(CompanySalaryBaseOptions)
            .filter(key => isNaN(+key))
            .forEach(key => {
                compSal['Base_' + key] = baseOptions.some(opt => opt === CompanySalaryBaseOptions[key]);
            });
        return compSal;
    }
}
