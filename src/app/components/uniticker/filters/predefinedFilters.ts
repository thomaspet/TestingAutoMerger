import {
    Component,
    Input,
    Output,
    OnChanges,
    EventEmitter,
    SimpleChanges,
    ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';
import {
    Ticker,
    TickerFilter,
    UniTickerService,
    IExpressionFilterValue
} from '../../../services/common/uniTickerService';
import {StatusService, StatisticsService, ErrorService} from '../../../services/services';

@Component({
    selector: 'uni-ticker-predefined-filters',
    templateUrl: './predefinedFilters.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTickerPredefinedFilters implements OnChanges {
    @Input() public filters: Array<TickerFilter>;
    @Input() public filtersAsNavbar: boolean;
    @Input() public ticker: Ticker;
    @Input() public selectedFilter: TickerFilter;
    @Input() public expressionFilters: Array<IExpressionFilterValue> = [];

    @Output() public filterSelected: EventEmitter<TickerFilter> = new EventEmitter();

    constructor(
        private uniTickerService: UniTickerService,
        private statusService: StatusService,
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
        private cdr: ChangeDetectorRef
    ) {}

    public onFilterSelected(filter: TickerFilter) {
        this.selectedFilter = filter;
        this.filterSelected.emit(filter);

        this.cdr.markForCheck();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (this.ticker && changes['ticker']) {
            // Refresh counters if ticker changed
            let tickerChanged = changes['ticker'].previousValue !== changes['ticker'].currentValue;
            if (tickerChanged) {
                this.getFilterCounts();
            }
        }
    }

    public getFilterCounts() {
        let selectQueries = this.filters.map((filter, index) => {
            let filterString;
            if (filter.FilterGroups && filter.FilterGroups.length) {
                filterString = this.uniTickerService.getFilterString(
                    filter.FilterGroups,
                    this.expressionFilters,
                    filter.UseAllCriterias,
                    this.ticker.Model
                );
            }

            if (!filterString) {
                filterString = filter.Filter  || 'ID gt 0';
            }

            return `sum(casewhen(${filterString}\\,1\\,0)) as FilterCount${index}`;
        });


        if (selectQueries.length) {
            let query = `model=${this.ticker.Model}&select=${selectQueries.join(',')}`
                + `&expand=${this.ticker.CountExpand || this.ticker.Expand}`;
            this.statisticsService.GetAll(query).subscribe(
                res => {
                    if (res.Data && res.Data.length > 0) {
                        let counters = res.Data[0];
                        for (let i = 0; i < this.filters.length; i++) {
                            let filter = this.filters[i];
                            filter.CurrentCount = counters['FilterCount' + i];
                        }

                        this.cdr.markForCheck();
                    }
                },
                err => {/* fail silently */} // this.errorService.handle(err)
            );
        }
    }
}
