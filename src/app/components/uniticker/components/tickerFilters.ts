import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {Ticker, TickerFilter} from '../../../services/common/uniTickerService';

declare const _; // lodash

@Component({
    selector: 'uni-ticker-filters',
    templateUrl: './tickerFilters.html'
})
export class UniTickerFilters {
    @Input() private filters: Array<TickerFilter>;
    @Input() private ticker: Ticker;
    @Input() private expanded: boolean = false;
    @Input() private selectedFilter: TickerFilter;

    @Output() filterSelected: EventEmitter<TickerFilter> = new EventEmitter<TickerFilter>();
    @Output() close: EventEmitter<any> = new EventEmitter<any>();

    private selectedMainModel: any;

    constructor() {
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

    private onFilterChanged(updatedFilter) {
        this.selectedFilter = _.cloneDeep(updatedFilter);
        this.filterSelected.emit(updatedFilter);
    }

    private onModelSelected(mainModel) {
        this.selectedMainModel = mainModel;
    }

    private stopPropagation() {
        event.stopPropagation();
    }

    private closeFilters() {
        this.close.emit();
        this.stopPropagation();
    }

    private onFieldAdded(event) {
        console.log('UniTickerFilters.field added: ', event);
    }
}
