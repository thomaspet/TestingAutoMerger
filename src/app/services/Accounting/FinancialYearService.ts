import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {FinancialYear} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Rx';


@Injectable()
export class FinancialYearService extends BizHttp<FinancialYear> {
    private ACTIVE_FINANCIAL_YEAR_LOCALSTORAGE_KEY: string = 'ActiveFinancialYear';

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = FinancialYear.RelativeUrl;
        this.entityType = FinancialYear.EntityType;
        this.DefaultOrderBy = null;
    }

    public storeActiveFinancialYearInLocalstorage(financialYear: FinancialYear, companyName: string) {
        localStorage.setItem(this.ACTIVE_FINANCIAL_YEAR_LOCALSTORAGE_KEY + '_' + companyName, JSON.stringify(financialYear));
    }

    public getActiveFinancialYearInLocalstorage(companyName: string): FinancialYear {
        const local = localStorage.getItem(this.ACTIVE_FINANCIAL_YEAR_LOCALSTORAGE_KEY + '_' + companyName);
        if (local !== null) {
            const instance = new FinancialYear();
            Object.assign(instance, JSON.parse(local));
            return instance;
        }
        return null;
    }
}
