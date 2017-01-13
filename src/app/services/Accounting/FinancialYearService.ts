import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {FinancialYear, Company, CompanySettings} from '../../unientities';
import {CompanySettingsService} from '../common/companySettingsService';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Rx';


@Injectable()
export class FinancialYearService extends BizHttp<FinancialYear> {
    private ACTIVE_FINANCIAL_YEAR_LOCALSTORAGE_KEY: string = 'activeFinancialYear';

    constructor(http: UniHttp, private companySettingsService: CompanySettingsService) {
        super(http);

        this.relativeURL = FinancialYear.RelativeUrl;
        this.entityType = FinancialYear.EntityType;
        this.DefaultOrderBy = null;
    }

    public storeActiveFinancialYearInLocalstorage(financialYear: FinancialYear, companyName: string) {
        localStorage.setItem(this.ACTIVE_FINANCIAL_YEAR_LOCALSTORAGE_KEY, JSON.stringify(financialYear));
    }

    public getActiveFinancialYearInLocalstorage(): FinancialYear {
        const local = localStorage.getItem(this.ACTIVE_FINANCIAL_YEAR_LOCALSTORAGE_KEY);
        if (local !== null) {
            const instance = new FinancialYear();
            Object.assign(instance, JSON.parse(local));
            return instance;
        }
        return null;
    }

    public getActiveFinancialYear(): Observable<number> {
        let financialYear = this.getActiveFinancialYearInLocalstorage() ;

        if (financialYear) {
            return Observable.of(financialYear.Year);
        } else {
            return this.companySettingsService.Get(1).map((res: CompanySettings) => res.CurrentAccountingYear);
        }
    }

    public getActiveFinancialYearEntity(): Observable<FinancialYear> {
        let financialYear = this.getActiveFinancialYearInLocalstorage() ;

        if (financialYear) {
            return Observable.of(financialYear);
        } else {
            return this.companySettingsService.Get(1)
                .switchMap((res: CompanySettings) => this.GetAll('filter=Year eq ' + res.CurrentAccountingYear));
        }
    }
}
