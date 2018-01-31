import * as moment from 'moment';
import {Injectable} from '@angular/core';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';

export class PeriodFilter {
    public year: number;
    public fromPeriodNo: number;
    public toPeriodNo: number;
    public name: string;
}

@Injectable()
export class PeriodFilterHelper {
    private PERIOD_LOCAL_STORAGE_KEY: string = 'ACCOUNTING_REPORTS_PERIOD_FILTER';

    constructor(
        private browserStorage: BrowserStorageService,
    ){}

    public getFilter(
        periodNumber: number,
        otherFilter: PeriodFilter,
        override: boolean = false
    ): PeriodFilter {
        let localStorageKey = this.PERIOD_LOCAL_STORAGE_KEY + periodNumber;

        let filter: PeriodFilter = this.browserStorage.getItem(localStorageKey);

        if (!filter) {
            filter = new PeriodFilter();

            if (override) {
                filter.year = otherFilter.year - 1;
                filter.fromPeriodNo = otherFilter.fromPeriodNo;
                filter.toPeriodNo = periodNumber;
            } else if (otherFilter) {
                // if the otherFilter parameter is specified, set default value for filter according to this
                filter.year = otherFilter.year - 1;
                filter.fromPeriodNo = otherFilter.fromPeriodNo;
                filter.toPeriodNo = otherFilter.toPeriodNo;
            } else {
                let today = moment(new Date());
                filter.year = today.year();
                filter.fromPeriodNo = 1;
                filter.toPeriodNo = today.month() + 1;
            }
        }

        filter.name = this.getFilterName(filter);

        return filter;
    }

    public saveFilterSettings(periodNumber: number, periodFilter: PeriodFilter) {
        let localStorageKey = this.PERIOD_LOCAL_STORAGE_KEY + periodNumber;
        this.browserStorage.setItem(localStorageKey, periodFilter);
    }

    public getFilterName(filter: PeriodFilter): string {
        let filterName: string = '';

        if (filter.fromPeriodNo.toString() !== filter.toPeriodNo.toString()) {
            filterName = `${filter.year}, periode ${filter.fromPeriodNo} - ${filter.toPeriodNo}`;
        } else {
            filterName = `${filter.year}, periode ${filter.fromPeriodNo}`;
        }

        return filterName;
    }
}
