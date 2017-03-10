import {Component, ViewChild, Input, Output, EventEmitter, SimpleChanges} from '@angular/core';
import {Ticker, TickerFilter, TickerFilterGroup, TickerFieldFilter} from '../../../services/common/uniTickerService';
import {Observable} from 'rxjs/Observable';

declare const _; // lodash

@Component({
    selector: 'uni-ticker-filter-editor',
    templateUrl: './tickerFilterEditor.html'
})
export class UniTickerFilterEditor {
    @Input() private ticker: Ticker;
    @Input() private filter: TickerFilter;
    @Input() private mainModel: any;

    @Output() filterChanged: EventEmitter<TickerFilter> = new EventEmitter<TickerFilter>();

    private fieldFilterGroups: Array<TickerFilterGroup> = [];

    constructor() {

    }

    private ngOnChanges(changes: SimpleChanges) {
        if (changes['filter']) {
            this.fieldFilterGroups = this.filter.FilterGroups;

            if (!this.fieldFilterGroups) {
                this.fieldFilterGroups = [];
            }

            if (this.fieldFilterGroups.length === 0) {
                this.fieldFilterGroups.push({
                    QueryGroup: 0,
                    FieldFilters: []
                });
            }
        }
    }

    private onChangeFieldFilter(fieldFilter, group) {
        this.filterChanged.emit(this.filter);
    }

    private onDeleteFieldFilter(fieldFilter: TickerFieldFilter, group: TickerFilterGroup) {
        _.remove(group.FieldFilters, fieldFilter);

        if (group.FieldFilters.length === 0) {
            _.remove(this.fieldFilterGroups, group);
        }

        this.filter.FilterGroups = this.fieldFilterGroups;
        this.filterChanged.emit(this.filter);
    }

    private addFieldFilter(group: TickerFilterGroup) {
        group.FieldFilters.push({
            Path: this.ticker.Model,
            Field: 'ID',
            Operator: 'eq',
            Value: '',
            Value2: null,
            QueryGroup: group.QueryGroup
        });
    }

    private addFieldFilterGroup() {
        let newGroup = {
            QueryGroup: this.fieldFilterGroups.length + 1,
            FieldFilters: []
        };

        this.addFieldFilter(newGroup);
        this.fieldFilterGroups.push(newGroup);
    }
}


