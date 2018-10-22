import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {FinancialYear, CompanySettings} from '../../unientities';
import {ErrorService} from '../common/errorService';
import {CompanySettingsService} from '../common/companySettingsService';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {ReplaySubject} from 'rxjs';
import 'rxjs/add/observable/of';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';

@Injectable()
export class FinancialYearService extends BizHttp<FinancialYear> {
    private ACTIVE_FINANCIAL_YEAR_LOCALSTORAGE_KEY: string = 'activeFinancialYear';
    public lastSelectedFinancialYear$: ReplaySubject<FinancialYear> = new ReplaySubject<FinancialYear>(1);

    constructor(
        http: UniHttp,
        private companySettingsService: CompanySettingsService,
        private errorService: ErrorService,
        private browserStorage: BrowserStorageService,
    ) {
        super(http);

        this.relativeURL = FinancialYear.RelativeUrl;
        this.entityType = FinancialYear.EntityType;
        this.DefaultOrderBy = null;

        this.lastSelectedFinancialYear$.subscribe(financialYear => {
            if (financialYear && financialYear.Year) {
                this.browserStorage.setItemOnCompany(this.ACTIVE_FINANCIAL_YEAR_LOCALSTORAGE_KEY, financialYear);
            }
        });
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

    public getActiveYear(): Observable<number> {
        return this.getActiveFinancialYear().map(x => x && x.Year);
    }

    public getActiveFinancialYear(): Observable<FinancialYear> {
        const cached = this.getYearInLocalStorage();
        if (cached) {
            return Observable.of(cached);
        } else {
            return Observable.forkJoin(
                this.companySettingsService.Get(1),
                this.GetAll(null))
                .map((res: [CompanySettings, FinancialYear[]]) => {
                    const [companySettings, financialYears] = res;
                    const fromCompanySettings = financialYears.find((year) => {
                        return year.Year === companySettings.CurrentAccountingYear;
                    });
                    return fromCompanySettings || financialYears[financialYears.length - 1];
                }, err => this.errorService.handle(err))
                .map(financialYear => {
                    this.setActiveYear(financialYear);
                    return financialYear;
                });
        }
    }
}
