import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {FinancialYear, Company, CompanySettings} from '../../unientities';
import {CompanySettingsService} from '../services';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Rx';


@Injectable()
export class FinancialYearService extends BizHttp<FinancialYear> {
    private ACTIVE_FINANCIAL_YEAR_LOCALSTORAGE_KEY: string = 'ActiveFinancialYear';

    constructor(
        http: UniHttp,
        private companySettingsService: CompanySettingsService
        ) {
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

 public getActiveFinancialYear(): Observable<number> {
        const activeCompany: Company = JSON.parse(localStorage.getItem('activeCompany'));
        let financialYear = this.getActiveFinancialYearInLocalstorage(activeCompany.Name) ;

        if (financialYear) {
            return Observable.of(financialYear.Year);
        } else {
            return this.companySettingsService.Get(1).map((res: CompanySettings) => res.CurrentAccountingYear);
        }
    }

}
