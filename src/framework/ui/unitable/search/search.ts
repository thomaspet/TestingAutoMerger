import {Component, SimpleChange, Input, Output, EventEmitter, OnChanges, ElementRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniTableColumnType} from '../config/unitableColumn';
import {ITableFilter} from '../unitable';
import * as Immutable from 'immutable';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {KeyCodes} from '../../../../app/services/common/keyCodes';

interface IUniTableSearchOperator {
    verb: string;
    operator: string;
    accepts: UniTableColumnType[];
}

@Component({
    selector: 'unitable-search',
    template: `
        <input class="unitableSearch_input" type="search" placeholder="Filter" [formControl]="basicSearchControl" />
        <button class="unitableSearch_advancedBtn" (click)="toggleAdvancedSearch()">Avansert…</button>

        <ul class="unitableSearch_advanced" [hidden]="!advancedSearch">
            <li class="unitableSearch_advanced_filter" *ngFor="let filter of advancedSearchFilters">

                <!-- Column select -->
                <select [(ngModel)]="filter.field" (ngModelChange)="filterFieldChange(filter)">
                    <option *ngFor="let col of filterableColumns" [value]="col.get('displayField') || col.get('field')">
                        {{col.get('header')}}
                    </option>
                </select>

                <!-- Operator select -->
                <select [(ngModel)]="filter.operator" (ngModelChange)="emitFilters()">
                    <ng-template  ngFor let-op [ngForOf]="operators">
                        <option [value]="op.operator">
                            {{op.verb}}
                        </option>
                    </ng-template>
                </select>

                <!-- Grouping -->
                <select [(ngModel)]="filter.group" (ngModelChange)="emitFilters()" *ngIf="allowGroupFilter">
                    <option value="0">Ingen gruppe</option>
                    <option value="1">Gruppe 1</option>
                    <option value="2">Gruppe 2</option>
                    <option value="3">Gruppe 3</option>
                    <option value="4">Gruppe 4</option>
                    <option value="5">Gruppe 5</option>
                </select>

                <!-- Query -->
                <input type="text" [(ngModel)]="filter.value" name="filterValue" (ngModelChange)="emitFilters()">

                <button type="button" (click)="removeFilter(filter)">Fjern</button>
            </li>

            <button type="button" (click)="newFilter()">Legg til</button>
        </ul>
    `
})
export class UniTableSearch implements OnChanges {
    constructor(
        private elementRef: ElementRef
    ) {}

    @Input()
    private columns: Immutable.List<any>;

    @Input()
    private configFilters: ITableFilter[];

    @Input()
    private allowGroupFilter: boolean;

    @Output()
    public filtersChange: EventEmitter<any> = new EventEmitter();

    @Output()
    public upOrDownArrows: Subject<KeyboardEvent> = new Subject<KeyboardEvent>();

    private filterableColumns: Immutable.List<any>;

    private basicSearchControl: FormControl = new FormControl('');
    private advancedSearch: boolean = false;

    private basicSearchFilters: ITableFilter[];
    private advancedSearchFilters: ITableFilter[];
    private emitFiltersTimeout: any;

    private operators: IUniTableSearchOperator[] = [
        {
            'verb': 'inneholder',
            'operator': 'contains',
            'accepts': [
                UniTableColumnType.Text,
                UniTableColumnType.Number,
                UniTableColumnType.Custom
            ]
        },
        {
            'verb': 'begynner med',
            'operator': 'startswith',
            'accepts': [
                UniTableColumnType.Text,
                UniTableColumnType.Number,
                UniTableColumnType.Lookup,
                UniTableColumnType.Custom
            ]
        },
        {
            'verb': 'slutter på',
            'operator': 'endswith',
            'accepts': [
                UniTableColumnType.Text,
                UniTableColumnType.Number,
                UniTableColumnType.Lookup,
                UniTableColumnType.Custom
            ]
        },
        {
            'verb': 'er',
            'operator': 'eq',
            'accepts': [
                UniTableColumnType.Text,
                UniTableColumnType.Number,
                UniTableColumnType.Lookup,
                UniTableColumnType.Custom
            ]
        },
        {
            'verb': 'er ikke',
            'operator': 'ne',
            'accepts': [
                UniTableColumnType.Text,
                UniTableColumnType.Number,
                UniTableColumnType.Lookup,
                UniTableColumnType.Custom
            ]
        },
        {
            'verb': 'er større enn',
            'operator': 'gt',
            'accepts': [
                UniTableColumnType.Number,
                UniTableColumnType.DateTime
            ]
        },
        {
            'verb': 'er større el. lik',
            'operator': 'ge',
            'accepts': [
                UniTableColumnType.Number,
                UniTableColumnType.DateTime
            ]
        },
        {
            'verb': 'er mindre enn',
            'operator': 'lt',
            'accepts': [
                UniTableColumnType.Number,
                UniTableColumnType.DateTime
            ]
        },
        {
            'verb': 'er mindre el. lik',
            'operator': 'le',
            'accepts': [
                UniTableColumnType.Number,
                UniTableColumnType.DateTime
            ]
        }
    ];

    public ngAfterViewInit() {
        this.basicSearchControl.valueChanges
            .debounceTime(250)
            .subscribe((value: string) => {
                this.buildBasicSearchFilter(value);
            });

        Observable.fromEvent(this.elementRef.nativeElement.querySelector('input'), 'keydown')
            .filter((event: KeyboardEvent) => {
                const key = (event.keyCode || event.which);
                return key === KeyCodes.UP_ARROW || key === KeyCodes.DOWN_ARROW;
            })
            .subscribe((event: KeyboardEvent) => this.upOrDownArrows.next(event));
    }

    public ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        if (changes['configFilters']) {
            this.advancedSearchFilters = this.configFilters;
        }

        if (changes['columns']) {
            if (changes['columns'].currentValue) {
                this.filterableColumns = this.columns.filter(x => x.get('sumFunction') == null || x.get('sumFunction') === '').toList();
            }
        }

        if (!this.advancedSearchFilters || this.advancedSearchFilters === []) {
            this.newFilter();
        }
    }

    private toggleAdvancedSearch() {
        this.advancedSearch = !this.advancedSearch;
    }

    private newFilter() {
        if (!this.advancedSearchFilters) {
            this.advancedSearchFilters = [];
        }
        this.advancedSearchFilters.push({field: '', operator: 'contains', value: '', group: 0, searchValue: ''});
    }

    private removeFilter(filter) {
        this.advancedSearchFilters.splice(this.advancedSearchFilters.indexOf(filter), 1);
        this.emitFilters();
    }

    private filterFieldChange(filter: ITableFilter) {
        this.emitFilters();
    }

    private buildBasicSearchFilter(value) {
        var filters = [];

        this.columns.forEach((column) => {
            let type = column.get('type');

            if (column.get('filterable') && !(type === UniTableColumnType.Number && isNaN(value))
                                         && !(type === UniTableColumnType.Money && isNaN(value))
                                         && !(type === UniTableColumnType.Percent && isNaN(value))
                                         && !(type === UniTableColumnType.DateTime && !Date.parse(value))) {

                filters.push({
                    field: column.get('displayField') || column.get('field'),
                    operator: column.get('filterOperator'),
                    value: value,
                    group: ''
                });
            }
        });

        this.basicSearchFilters = filters;

        this.emitFilters();
    }

    public emitFilters() {

        if (this.emitFiltersTimeout) {
            clearTimeout(this.emitFiltersTimeout);
        }

        this.emitFiltersTimeout = setTimeout(() => {
            this.filtersChange.emit({
                basicSearchFilters: this.basicSearchFilters,
                advancedSearchFilters: this.getAdvancedFilters()
            });
        }, 250);
    }

    private getAdvancedFilters() {
        var filters = [];
        this.advancedSearchFilters.forEach((filter) => {

            filter.searchValue = filter.value.toString();

            let cols = this.columns.filter(c => c.get('field') === filter.field);

            cols.forEach(col => {
                if (col.get('type') === UniTableColumnType.DateTime || col.get('type') === UniTableColumnType.LocalDate) {
                    if (filter.value.toString().includes('.')) {

                        let dateParts = filter.value.toString().split('.', 3);
                        if (dateParts.length === 3) {
                            filter.searchValue = dateParts[2] + '-' + dateParts[1] + '-' + dateParts[0];
                        }
                        if (dateParts.length === 2) {
                            filter.searchValue = dateParts[1] + '-' + dateParts[0];
                        }
                    }
                }
            });
            filters.push(filter);
        });

        return filters;
    }
}
