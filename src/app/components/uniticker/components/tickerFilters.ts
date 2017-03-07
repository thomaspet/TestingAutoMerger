import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {Ticker, TickerFilter} from '../../../services/common/UniTickerService';

@Component({
    selector: 'uni-ticker-filters',
    templateUrl: 'app/components/uniticker/components/tickerFilters.html'
})
export class UniTickerFilters {
    @Input() private filters: Array<TickerFilter>;
    @Input() private ticker: Ticker;
    @Input() private expanded: boolean = false;

    @Output() filterSelected: EventEmitter<TickerFilter> = new EventEmitter<TickerFilter>();

    constructor() {
    }

    public ngOnInit() {

    }

    public onFilterSelected(filter: TickerFilter) {
        this.filters.forEach(x => {
            x.IsActive = false;
        });

        filter.IsActive = true;

        this.filterSelected.emit(filter);

        event.stopPropagation();
    }
}
