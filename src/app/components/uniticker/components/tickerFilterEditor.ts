import {Component, ViewChild, Input, Output, EventEmitter, SimpleChanges, ChangeDetectionStrategy} from '@angular/core';
import {Ticker, TickerFilter, TickerFilterGroup, TickerFieldFilter} from '../../../services/common/uniTickerService';
import {Observable} from 'rxjs/Observable';

declare const _; // lodash

@Component({
    selector: 'uni-ticker-filter-editor',
    templateUrl: './tickerFilterEditor.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTickerFilterEditor {
    @Input() private ticker: Ticker;
    @Input() private filter: TickerFilter;
    @Input() private mainModel: any;

    @Output() filterChanged: EventEmitter<TickerFilter> = new EventEmitter<TickerFilter>();

    constructor() {

    }

    private ngOnChanges(changes: SimpleChanges) {

        if (changes['filter'] && !this.filter) {
            this.filter = new TickerFilter();
            this.filter.Code = this.ticker.Model + 'Custom';
            this.filter.Name = 'Egendefinert';
            this.filter.FilterGroups = [];
        }

        if (changes['filter']) {
            if (!this.filter.FilterGroups) {
                this.filter.FilterGroups = [];
            }

            if (this.filter.FilterGroups.length === 0) {
                this.addFieldFilterGroup(false);
            }

            if (!this.filter.FilterGroups) {
                this.filter.FilterGroups = [];
            }

            if (this.filter.FilterGroups.length === 0) {
                this.filter.FilterGroups.push({
                    QueryGroup: 0,
                    UseAllCriterias: true,
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
            _.remove(this.filter.FilterGroups, group);
        }

        this.filterChanged.emit(this.filter);
    }

    private updateTicker() {
        this.filterChanged.emit(this.filter);
    }

    private addFieldFilter(group: TickerFilterGroup) {
        group.FieldFilters.push({
            Path: this.ticker.Model,
            Field: null,
            Operator: 'eq',
            Value: null,
            Value2: null,
            QueryGroup: group.QueryGroup
        });
    }

    private addFieldFilterGroup(addFilter: boolean) {
        let newGroup = {
            QueryGroup: this.filter.FilterGroups.length + 1,
            UseAllCriterias: true,
            FieldFilters: []
        };

        if (addFilter) {
            this.addFieldFilter(newGroup);
        }

        this.filter.FilterGroups.push(newGroup);
    }
}


