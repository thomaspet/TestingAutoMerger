import {
    Component,
    Input,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import * as moment from 'moment';

import { UniModalService } from '@uni-framework/uni-modal';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { AdvancedFilters } from './advanced-filters/advanced-filters';
import { ITableFilter, ISavedSearch } from '../interfaces';
import { TableUtils } from '../services/table-utils';

@Component({
    selector: 'table-filters',
    templateUrl: './filters.html',
    styleUrls: ['./filters.sass'],
    host: {class: 'uni-redesign'},
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableFilters {
    @Input() tableConfig: UniTableConfig;
    @Input() columns: UniTableColumn[];
    @Input() filters: ITableFilter[];

    @Output() filtersChange: EventEmitter<any> = new EventEmitter();

    onDestroy$: Subject<any> = new Subject();
    searchControl: FormControl = new FormControl('');

    tableName: string;
    visibleColumns: UniTableColumn[];
    savedSearches: ISavedSearch[] = [];
    basicSearchFilters: ITableFilter[];
    advancedSearchFilters: ITableFilter[];

    constructor(
        private cdr: ChangeDetectorRef,
        private modalService: UniModalService,
        private utils: TableUtils
    ) {}

    ngAfterViewInit() {
        this.searchControl.valueChanges.pipe(
            takeUntil(this.onDestroy$),
            debounceTime(250)
        ).subscribe(value => {

            this.basicSearchFilters = this.getBasicSearchFilters(value);
            this.emitFilters();
        });
    }

    ngOnChanges(changes) {
        if (this.filters && this.columns) {
            this.visibleColumns = this.columns.filter(col => col.visible);

            // cloneDeep?
            this.advancedSearchFilters = this.setDisplayTextOnFilters(this.filters);
        }

        if (changes['tableConfig'] && this.tableConfig) {
            const tableName = this.tableConfig.configStoreKey;
            if (tableName !== this.tableName) {
                // Get last used filter and update local vars.
                // Don't emit any changes. Applying the filter is handled in data-service.
                const lastUsedFilter = this.utils.getLastUsedFilter(tableName) || <any> {};
                this.basicSearchFilters = lastUsedFilter.basicSearchFilters || [];
                this.advancedSearchFilters = lastUsedFilter.advancedSearchFilters || [];

                const searchText = lastUsedFilter.searchText || '';
                this.searchControl.setValue(searchText, { emitEvent: false });
            }

            this.tableName = this.tableConfig.configStoreKey;
            this.getSavedSearches();
        }
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    private getSavedSearches() {
        this.savedSearches = this.utils.getSavedSearches(this.tableName);
        this.cdr.markForCheck();
    }

    applySearch(search?) {
        if (search) {
            this.advancedSearchFilters = search.filters;
        } else {
            this.advancedSearchFilters = [];
        }

        this.emitFilters();
        this.cdr.markForCheck();
    }

    deleteSearch(index: number, event: MouseEvent) {
        event.stopPropagation();
        this.savedSearches = this.utils.removeSearch(this.tableName, this.savedSearches[index]);
        this.cdr.markForCheck();
    }

    showAdvancedFilters(focusIndex?: number, savedSearch?: ISavedSearch) {
        this.modalService.open(AdvancedFilters, {
            closeOnClickOutside: true,
            data: {
                columns: this.visibleColumns,
                config: this.tableConfig,
                filters: (savedSearch && savedSearch.filters) || this.advancedSearchFilters,
                focusIndex: focusIndex,
                searchName: savedSearch && savedSearch.name
            }
        }).onClose.subscribe(filters => {
            this.getSavedSearches();

            if (filters) {
                this.advancedSearchFilters = this.setDisplayTextOnFilters(filters);
                this.emitFilters();
                this.cdr.markForCheck();
            }
        });
    }

    removeFilter(index: number) {
        this.advancedSearchFilters.splice(index, 1);
        this.emitFilters();
        this.cdr.markForCheck();
    }

    removeAll() {
        this.advancedSearchFilters = [];
        this.emitFilters();
        this.cdr.markForCheck();
    }

    // REVISIT: Copy-paste from old search. Should definitely improve this.
    private getBasicSearchFilters(value) {
        const filters = [];

        this.visibleColumns.forEach((column) => {
            const type = column.type;

            if (column.filterable
                && !(type === UniTableColumnType.Number && isNaN(value))
                && !(type === UniTableColumnType.Money && isNaN(value))
                && !(type === UniTableColumnType.Percent && isNaN(value))
                && !(type === UniTableColumnType.DateTime && !Date.parse(value))
            ) {
                filters.push({
                    field: column.displayField || column.field,
                    operator: column.filterOperator,
                    value: value,
                    group: ''
                });
            }
        });

        return filters;
    }


    private emitFilters() {
        const lastUsedFilter = {
            searchText: this.searchControl.value || '',
            basicSearchFilters: this.basicSearchFilters,
            advancedSearchFilters: this.advancedSearchFilters
        };

        this.utils.setLastUsedFilter(this.tableName, lastUsedFilter);

        this.filtersChange.emit({
            basicSearchFilters: this.basicSearchFilters,
            advancedSearchFilters: this.advancedSearchFilters
        });
    }

    private setDisplayTextOnFilters(filters: ITableFilter[]): ITableFilter[] {
        return filters.map(filter => {
            let header, operator, value;

            const column = this.columns && this.columns.find(col => col.field === filter.field);
            const selectConfig = filter.selectConfig;
            header = column ? column.header : filter.field;

            operator = this.getOperatorTranslation(filter) || filter.operator;

            if (filter.isDate) {
                value = moment(filter.value).format('DD.MM.YYYY');
            } else {
                if (selectConfig && selectConfig.options) {
                    const item = selectConfig.options.find(option => {
                        const optionValue = option[selectConfig.valueField];
                        return optionValue.toString() === filter.value.toString();
                    });

                    if (item) {
                        value = item[selectConfig.displayField];
                    }
                }

                if (!value) {
                    value = isNaN(+filter.value) ? `"${filter.value}"` : filter.value;
                }
            }

            filter['_displayText'] = `${header} ${operator} ${value}`;
            return filter;
        });
    }

    private getOperatorTranslation(filter): string {
        switch (filter.operator) {
            case 'eq':
                return 'er';
            case 'ne':
                return 'er ikke';
            case 'lt':
                return filter.isDate ? 'før' : 'mindre enn';
            case 'gt':
                return filter.isDate ? 'etter' : 'større enn';
            case 'le':
                return filter.isDate ? 't.o.m.' : 'mindre enn/lik';
            case 'ge':
                return filter.isDate ? 'f.o.m.' : 'større enn/lik';
            case 'contains':
                return 'inneholder';
            case 'startswith':
                return 'begynner på';
            default:
                return filter.operator;
        }
    }
}
