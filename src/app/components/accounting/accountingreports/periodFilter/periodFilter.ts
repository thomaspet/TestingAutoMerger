declare const moment;

export class PeriodFilter {
    public year: number;
    public fromPeriodNo: number;
    public toPeriodNo: number;
    public name: string;
}

export class PeriodFilterHelper {
    private static PERIOD_LOCAL_STORAGE_KEY: string = 'ACCOUNTING_REPORTS_PERIOD_FILTER';

    public static getFilter(periodNumber: number, otherFilter: PeriodFilter): PeriodFilter {
        let filter: PeriodFilter = null;

        let localStorageKey = this.PERIOD_LOCAL_STORAGE_KEY + periodNumber;

        // get from localStorage if that exists, if not, get resonable default period
        if (localStorage.getItem(localStorageKey)) {
            filter = JSON.parse(localStorage.getItem(localStorageKey));
        }

        if (!filter) {
            filter = new PeriodFilter();

            if (otherFilter) {
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

    public static saveFilterSettings(periodNumber: number, periodFilter: PeriodFilter) {
        let localStorageKey = this.PERIOD_LOCAL_STORAGE_KEY + periodNumber;
        localStorage.setItem(localStorageKey, JSON.stringify(periodFilter));
    }

    public static getFilterName(filter: PeriodFilter): string {
        let filterName: string = '';

        if (filter.fromPeriodNo.toString() !== filter.toPeriodNo.toString()) {
            filterName = `${filter.year}, periode ${filter.fromPeriodNo} - ${filter.toPeriodNo}`;
        } else {
            filterName = `${filter.year}, periode ${filter.fromPeriodNo}`;
        }

        return filterName;
    }
}
