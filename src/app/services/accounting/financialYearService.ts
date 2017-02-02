import { Injectable } from '@angular/core';
import { BizHttp } from '../../../framework/core/http/BizHttp';
import { FinancialYear, CompanySettings } from '../../unientities';
import { ErrorService } from '../common/errorService';
import { CompanySettingsService } from '../common/companySettingsService';
import { UniHttp } from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs/ReplaySubject';


@Injectable()
export class FinancialYearService extends BizHttp<FinancialYear> {
    private ACTIVE_FINANCIAL_YEAR_LOCALSTORAGE_KEY: string = 'activeFinancialYear';
    private lastSelectedYear: ReplaySubject<FinancialYear>;
    public lastSelectedYear$: Observable<FinancialYear>;

    constructor(
        http: UniHttp,
        private companySettingsService: CompanySettingsService,
        private errorService: ErrorService) {
        super(http);

        this.relativeURL = FinancialYear.RelativeUrl;
        this.entityType = FinancialYear.EntityType;
        this.DefaultOrderBy = null;
        this.lastSelectedYear = new ReplaySubject<FinancialYear>(1);
        this.lastSelectedYear$ = this.lastSelectedYear.asObservable();
        this.getActiveFinancialYear().subscribe(financialYear => this.lastSelectedYear.next(financialYear));
    }

    public setActiveYear(financialYear: FinancialYear) {
        if (financialYear) {
            localStorage.setItem(this.ACTIVE_FINANCIAL_YEAR_LOCALSTORAGE_KEY, JSON.stringify(financialYear));
            this.lastSelectedYear.next(financialYear);
        }
    }

    public getYearInLocalStorage(): FinancialYear {
        const local = localStorage.getItem(this.ACTIVE_FINANCIAL_YEAR_LOCALSTORAGE_KEY);
        if (local !== null) {
            const instance = new FinancialYear();
            Object.assign(instance, JSON.parse(local));
            return instance;
        }
        return null;
    }

    public getActiveYear(): Observable<number> {
        return this.getActiveFinancialYear().map(x => x.Year);
    }

    public getActiveFinancialYear(): Observable<FinancialYear> {
        let cached = this.getYearInLocalStorage();
        if (cached) {
            return Observable.of(cached);
        } else {
            return Observable.forkJoin(
                this.companySettingsService.Get(1),
                this.GetAll(null))
                .map((res: [CompanySettings, FinancialYear[]]) => {
                    let [companySettings, financialYears] = res;
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
