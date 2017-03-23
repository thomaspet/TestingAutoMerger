import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {Ticker, TickerFilter, TickerFieldFilter, UniTickerService, ApiModel} from '../../../services/common/uniTickerService';
import {StatusService} from '../../../services/services';

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
    @Output() filterChanged: EventEmitter<TickerFilter> = new EventEmitter<TickerFilter>();
    @Output() close: EventEmitter<any> = new EventEmitter<any>();

    private selectedMainModel: ApiModel;
    private operators: Array<any>;

    constructor(private uniTickerService: UniTickerService, private statusService: StatusService) {
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

        // TODO: Get translated name when that is available through the API
        if (fieldFilter.Field.toLocaleLowerCase() === 'statuscode') {
            filter += 'Status ';
        } else {
            filter += fieldFilter.Field + ' ';
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

        return filter;
    }

    private onModelSelected(mainModel) {
        this.selectedMainModel = mainModel;
    }

    private stopPropagation() {
        event.stopPropagation();
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
