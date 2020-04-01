import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {FinancialYear} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable, ReplaySubject} from 'rxjs';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';

@Injectable()
export class FinancialYearService extends BizHttp<FinancialYear> {
    private ACTIVE_FINANCIAL_YEAR_LOCALSTORAGE_KEY: string = 'activeFinancialYear';
    public lastSelectedFinancialYear$: ReplaySubject<FinancialYear> = new ReplaySubject<FinancialYear>(1);

    constructor(http: UniHttp, private browserStorage: BrowserStorageService) {
        super(http);

        this.relativeURL = FinancialYear.RelativeUrl;
        this.entityType = FinancialYear.EntityType;
        this.DefaultOrderBy = null;

        // set the next to nofify other components at startup what year is active - this
        // will set the active year either based on localStorage (previous selected year)
        // or based on the current date
        this.lastSelectedFinancialYear$.next(this.getActiveFinancialYear());

        this.lastSelectedFinancialYear$.subscribe(financialYear => {
            if (financialYear && financialYear.Year) {
                this.browserStorage.setItemOnCompany(this.ACTIVE_FINANCIAL_YEAR_LOCALSTORAGE_KEY, financialYear);
            }
        });
    }

    public createFinancialYear(year: number): Observable<FinancialYear> {
        return this.GetAction(null, 'create-financial-year', `year=${year}`);
    }

    public setActiveYear(financialYear: FinancialYear) {
        this.lastSelectedFinancialYear$.next(financialYear);
    }

    public getYearInLocalStorage(): FinancialYear {
        try {
            const local = this.browserStorage.getItemFromCompany(this.ACTIVE_FINANCIAL_YEAR_LOCALSTORAGE_KEY);
            const year = new FinancialYear();
            Object.assign(year, local);

            if (year.Year) {
                return year;
            } else {
                this.browserStorage.removeItemFromCompany(this.ACTIVE_FINANCIAL_YEAR_LOCALSTORAGE_KEY);
                return null;
            }
        } catch (e) {
            return null;
        }
    }

    public getActiveYear(): number {
        const financialYear = this.getActiveFinancialYear();

        return financialYear ? financialYear.Year : null;
    }

    public getActiveFinancialYear(): FinancialYear {
        const cached = this.getYearInLocalStorage();
        if (cached) {
            return cached;
        } else {
            return { Year: new Date().getFullYear() } as FinancialYear;
        }
    }
}
