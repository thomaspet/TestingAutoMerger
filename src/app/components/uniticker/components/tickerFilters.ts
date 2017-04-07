import {Component, ViewChild, Input, Output, EventEmitter, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Ticker, TickerFilter, TickerFieldFilter, TickerFilterGroup, UniTickerService, IExpressionFilterValue} from '../../../services/common/uniTickerService';
import {ApiModel} from '../../../services/common/apiModelService';
import {StatusService, StatisticsService, ErrorService} from '../../../services/services';

declare const _; // lodash

@Component({
    selector: 'uni-ticker-filters',
    templateUrl: './tickerFilters.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTickerFilters {
    @Input() private filters: Array<TickerFilter>;
    @Input() private ticker: Ticker;
    @Input() private expanded: boolean = false;
    @Input() private selectedFilter: TickerFilter;
    @Input() private showPredefinedFilters: boolean = true;
    @Input() private expressionFilters: Array<IExpressionFilterValue> = [];

    @Output() filterSelected: EventEmitter<TickerFilter> = new EventEmitter<TickerFilter>();
    @Output() filterChanged: EventEmitter<TickerFilter> = new EventEmitter<TickerFilter>();
    @Output() close: EventEmitter<any> = new EventEmitter<any>();

    private hideTreeForNowBecauseWeDontKnowWhatToUseItFor: boolean = true;

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

    public onFilterSelected(filter: TickerFilter) {
        this.filters.forEach(x => {
            x.IsActive = false;
        });

        filter.IsActive = true;

        this.selectedFilter = filter;

        this.filterSelected.emit(filter);
        this.stopPropagation();
    }

    private ngOnChanges(changes: SimpleChanges) {
        if (changes['ticker'] && this.didLoadFilterCounters) {
            // if ticker changed, we need to reload the counters
            if (changes['ticker'].previousValue && changes['ticker'].previousValue.Code !== this.ticker.Code) {
                this.didLoadFilterCounters = false;
            }
        }

        if (changes['filters'] && this.ticker) {
            this.filters.forEach((filter) => {
                if (!filter.FilterGroups) {
                    filter.FilterGroups = [];
                }

                let newFilterGroup = new TickerFilterGroup();
                newFilterGroup.FieldFilters = [];
                newFilterGroup.UseAllCriterias = true;

                // create an extra filtergroup for each Columns
                this.ticker.Columns.forEach((column) => {
                    if (column.FilterOperator) {
                        let newFieldFilter = new TickerFieldFilter();
                        newFieldFilter.Field = column.SelectableFieldName;
                        newFieldFilter.Operator = column.FilterOperator;
                        newFieldFilter.Value = '';
                        newFilterGroup.FieldFilters.push(newFieldFilter);
                    }
                });

                filter.FilterGroups.unshift(newFilterGroup);
            });
        }

        if (this.ticker) {
            this.selectedMainModel = this.ticker.ApiModel;
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

    private getModelName() {

        if (this.selectedMainModel) {
            return this.selectedMainModel.TranslatedName ? this.selectedMainModel.TranslatedName: this.selectedMainModel.Name;
        }

        if (this.ticker.ApiModel) {
            return this.ticker.ApiModel.TranslatedName ? this.ticker.ApiModel.TranslatedName: this.ticker.ApiModel.Name;
        }

        return this.ticker.Model;
    }

    public setStandardSearch() {
        alert('Ikke implementert - dette krever at serverside funksjonalitet er på plass');
    }

    private onFilterChanged(updatedFilter) {
        this.selectedFilter = _.cloneDeep(updatedFilter);
        this.filterChanged.emit(updatedFilter);
    }

    private getFilterHumanReadable(fieldFilter: TickerFieldFilter) {
        let filter: string = '';

        if (fieldFilter.Value && fieldFilter.Value !== '') {
            // TODO: Get translated name when that is available through the API
            if (fieldFilter.Field.toLocaleLowerCase() === 'statuscode') {
                filter += 'Status ';
            } else {
                let filteredColumn = this.ticker.Columns.find(x => x.Field === fieldFilter.Field);

                if (filteredColumn) {
                    filter += filteredColumn.Header + ' ';
                } else {
                    filter += fieldFilter.Field + ' ';
                }
            }

            let operatorReadable = this.operators.find(x => x.operator === fieldFilter.Operator);
            filter += (operatorReadable ? operatorReadable.verb : fieldFilter.Operator) + ' ';

            // replace with statuscode if field == statuscode
            if (fieldFilter.Field.toLowerCase().endsWith('statuscode')) {
                let status = this.statusService.getStatusText(+fieldFilter.Value);
                filter += (status ? status : fieldFilter.Value);
            } else if (fieldFilter.Value.toLowerCase() === 'getdate()') {
                filter += 'dagens dato';
            } else {
                filter += fieldFilter.Value;
            }

            filter += ' ';
        }

        return filter;
    }

    private onModelSelected(mainModel) {
        this.selectedMainModel = mainModel;
    }

    private stopPropagation() {
        if (event) {
            event.stopPropagation();
        }
    }

    private closeFilters() {
        this.filterChanged.emit(_.cloneDeep(this.selectedFilter));

        this.close.emit();
        this.stopPropagation();
    }

    private onFieldAdded(event) {
        this.filterChanged.emit(_.cloneDeep(this.selectedFilter));
    }
}
