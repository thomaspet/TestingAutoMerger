import {Component, ViewChild, Input, Output, EventEmitter, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Ticker, TickerFilter, TickerFieldFilter, UniTickerService, IExpressionFilterValue} from '../../../services/common/uniTickerService';
import {ApiModel} from '../../../services/common/apiModelService';
import {StatusService, StatisticsService, ErrorService} from '../../../services/services';

declare const _; // lodash

@Component({
    selector: 'uni-ticker-filters-nav-bar',
    templateUrl: './tickerFiltersNavBar.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTickerFiltersNavBar {
    @Input() private filters: Array<TickerFilter>;
    @Input() private ticker: Ticker;
    @Input() private expanded: boolean = false;
    @Input() private selectedFilter: TickerFilter;
    @Input() private expressionFilters: Array<IExpressionFilterValue> = [];

    @Output() filterSelected: EventEmitter<TickerFilter> = new EventEmitter<TickerFilter>();

    private selectedMainModel: ApiModel;
    private operators: Array<any>;
    private didLoadFilterCounters: boolean = false;

    constructor(
        private uniTickerService: UniTickerService,
        private statusService: StatusService,
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
        private cdr: ChangeDetectorRef) {
        this.operators = uniTickerService.getOperators();
    }

    public ngOnInit() {

    }

    public onFilterSelected(filter: TickerFilter, event) {
        this.filters.forEach(x => {
            x.IsActive = false;
        });

        filter.IsActive = true;

        this.selectedFilter = filter;

        this.filterSelected.emit(filter);

        this.cdr.markForCheck();
        this.stopPropagation(event);
    }

    private ngOnChanges(changes: SimpleChanges) {
        if (changes['ticker'] && this.didLoadFilterCounters) {
            // if ticker changed, we need to reload the counters
            if (changes['ticker'].previousValue && changes['ticker'].previousValue.Code !== this.ticker.Code) {
                this.didLoadFilterCounters = false;
            }
        }

        if (!this.didLoadFilterCounters && this.ticker && this.filters) {
            this.getFilterCounts();
        }
    }

    private getFilterCounts() {
        this.didLoadFilterCounters = true;

        let filterCountSelect: Array<string> = [];
        for (let i = 0; i < this.filters.length; i++) {
            let filter = this.filters[i];
            filter.CurrentCount = null;
            let select = '';

            if (filter.FilterGroups && filter.FilterGroups.length > 0) {
                let filterString = this.uniTickerService.getFilterString(filter.FilterGroups, this.expressionFilters, filter.UseAllCriterias, this.ticker.Model);
                if (filterString && filterString !== '') {
                    select = `sum(casewhen(${filterString}\\,1\\,0))`;
                }
            }

            if (!select || select === '') {
                if (filter.Filter && filter.Filter !== '') {
                    select = `sum(casewhen(${filter.Filter}\\,1\\,0))`;
                } else {
                    // dummy to count empty filters, i.e. all rows
                    select = 'sum(casewhen(ID gt 0\\,1\\,0))';
                }
            }

            select += ' as FilterCount' + i;

            filterCountSelect.push(select);
        }

        if (filterCountSelect.length > 0) {
            let query = `model=${this.ticker.Model}&select=${filterCountSelect.join(',')}&expand=${this.ticker.Expand}`;

            this.statisticsService.GetAll(query)
                .subscribe(res => {
                    if (res.Data && res.Data.length > 0) {

                        let counters = res.Data[0];
                        for (let i = 0; i < this.filters.length; i++) {
                            let filter = this.filters[i];
                            filter.CurrentCount = counters['FilterCount' + i];
                        }

                        this.cdr.markForCheck();
                    }
                }, err => this.errorService.handle(err)
            );
        }
    }
    private stopPropagation(event) {
        if (event) {
            event.stopPropagation();
        }
    }
}
