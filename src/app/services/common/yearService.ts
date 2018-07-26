import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/of';

import {CompanySettings} from '@app/unientities';
import {CompanySettingsService} from './companySettingsService';
import {TabService} from '@app/components/layout/navbar/tabstrip/tabService';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';

@Injectable()
export class YearService {
    private ACTIVE_YEAR_KEY: string = 'ActiveYear';
    private activeYear: number;

    public selectedYear$: BehaviorSubject<number>;

    constructor(
        private companySettings: CompanySettingsService,
        private tabservice: TabService,
        private router: Router,
        private browserStorage: BrowserStorageService,
    ) {
            this.selectedYear$ = new BehaviorSubject<number>(this.activeYear);

            this.getActiveYear().subscribe(year => {
                this.activeYear = year;
                this.selectedYear$.next(this.activeYear);
            });
        }

    public setSelectedYear(year: number): void {
        if (year !== this.getSavedYear()) {
            this.browserStorage.setItem(this.ACTIVE_YEAR_KEY, year.toString());
            this.selectedYear$.next(year);
        }
    }

    public getActiveYear(): Observable<number> {
        const val = this.browserStorage.getItem(this.ACTIVE_YEAR_KEY);
        if (val) {
            return Observable.of(parseInt(val, 10));
        }
        return this.GetDefaultYear();
    }

    public getSavedYear(): number {
        return parseInt(this.browserStorage.getItem(this.ACTIVE_YEAR_KEY), 10);

    }

    public clearActiveYear(): void {
        this.browserStorage.removeItem(this.ACTIVE_YEAR_KEY);
    }


    private GetDefaultYear(): Observable<number> {
        return this.companySettings.Get(1).map((settings: CompanySettings) => {
            const year = settings.CurrentAccountingYear;

            // CompanySettings seems to have '0' as year for some companies..
            return year && +year > 0 ? year : new Date().getFullYear();
        });
    }
}
