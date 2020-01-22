import { Component, EventEmitter, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { cloneDeep } from 'lodash';

import { IModalOptions } from '@uni-framework/uni-modal';
import { UniTableColumn, UniTableConfig, UniTableColumnType } from '@uni-framework/ui/unitable';

import {
    defaultOperators,
    dateOperators,
    statusOperators,
    numericOperators
} from '../filter-operators';
import { ITableFilter, ISavedSearch } from '../../interfaces';
import { TableUtils } from '../../services/table-utils';

@Component({
    selector: 'advanced-filters',
    templateUrl: './advanced-filters.html',
    styleUrls: ['./advanced-filters.sass'],
    host: {class: 'uni-redesign'}
})
export class AdvancedFilters {
    @ViewChildren('filterRow') filterRows: QueryList<ElementRef>;

    options: IModalOptions = {};
    onClose: EventEmitter<ITableFilter[]> = new EventEmitter();

    config: UniTableConfig;
    columns: UniTableColumn[];
    filters: ITableFilter[];

    filtersChange: EventEmitter<ITableFilter[]> = new EventEmitter();

    tableName: string;
    searchName: string = '';

    savedSearches: ISavedSearch[];
    filteredSavedSearches: ISavedSearch[];

    constructor(private utils: TableUtils) {}

    ngOnInit() {
        const data = this.options.data || {};
        this.config = data.config;
        this.columns = data.columns;
        this.filters = data.filters;
        this.searchName = data.searchName || '';

        const filters = cloneDeep(this.filters || []);

        if (!filters.length) {
            filters.push({
                field: '',
                operator: '',
                value: ''
            });
        }

        this.filters = filters.map(filter => {
            if (filter.field) {
                const column = this.columns.find(col => col.field === filter.field);
                if (!column) {
                    filter['_readonlyField'] = true;
                }
            }

            filter = this.setFilterOperators(filter);
            return filter;
        });

        this.tableName = this.config.configStoreKey;
        this.savedSearches = this.utils.getSavedSearches(this.tableName);
        this.filteredSavedSearches = this.savedSearches;
    }

    ngAfterViewInit() {
        const data = this.options.data || {};
        this.focus(data.focusIndex);
    }

    submitFilters() {
        const validFilters = this.filters.filter(f => !!f.field && !!f.value);
        this.onClose.emit(validFilters);
    }

    close(resetFilters: boolean) {
        if (resetFilters) {
            this.onClose.emit([]);
        } else {
            this.onClose.emit();
        }
    }

    saveSearch() {
        this.searchName = this.searchName.trim();
        this.utils.saveSearch(this.tableName, {
            name: this.searchName,
            filters: this.filters
        });

        this.submitFilters();
    }

    filterSavedSearches(query: string) {
        this.filteredSavedSearches = this.savedSearches.filter(search => {
            return (search.name || '').toLowerCase().includes(query.toLowerCase());
        });
    }

    addFilter() {
        const newFilter = this.setFilterOperators({
            field: '',
            operator: '',
            value: ''
        });

        this.filters.push(newFilter);
        this.focus();
    }

    removeFilter(index: number) {
        this.filters.splice(index, 1);

        if (this.filters.length) {
            this.focus();
        } else {
            this.addFilter();
        }
    }

    focus(index?: number) {
        setTimeout(() => {
            try {
                if (index >= 0 && index < this.filterRows.length) {
                    const row = this.filterRows.toArray()[index].nativeElement;
                    row.querySelector('.filter-value-input').focus();
                } else {
                    const row = this.filterRows.last.nativeElement;
                    row.querySelector('select').focus();
                }
            } catch (e) { console.error(e); }
        });
    }

    onColumnSelected(filter: ITableFilter) {
        const column = filter.field && this.columns.find(col => col.field === filter.field);
        filter.isDate = column && (
            column.type === UniTableColumnType.LocalDate
            || column.type === UniTableColumnType.DateTime
        );

        filter.selectConfig = column.filterSelectConfig;
        filter.value = '';

        this.setFilterOperators(filter);
    }

    setFilterOperators(filter: ITableFilter) {
        let operators = defaultOperators;
        const column = filter.field && this.columns.find(col => col.field === filter.field);

        if (column) {
            if (column.type === UniTableColumnType.DateTime || column.type === UniTableColumnType.LocalDate) {
                operators = dateOperators;
            } else if (column.type === UniTableColumnType.Number || column.type === UniTableColumnType.Percent) {
                operators = numericOperators;
            } else if  (column.type === UniTableColumnType.Status) {
                operators = statusOperators;
            } else if (column.type === UniTableColumnType.Boolean) {
                operators = [{ label: 'er', operator: 'eq' }];
            }
        }

        filter['_availableOperators'] = operators;

        if (!filter.operator || !operators.some(op => op.operator === filter.operator)) {
            filter.operator = operators[0].operator;
        }

        return filter;
    }
}
