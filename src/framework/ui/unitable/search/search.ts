import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnChanges,
    ViewChild,
    ElementRef,
    HostListener,
    ChangeDetectorRef
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniTableColumnType} from '../config/unitableColumn';
import {ITableFilter} from '../unitable';
import {KeyCodes} from '../../../../app/services/common/keyCodes';
import {UniTableUtils, ISavedFilter} from '../unitableUtils';
import {IUniTableConfig} from '../config/unitableConfig';

import {fromEvent, Observable} from 'rxjs';
import {Subject} from 'rxjs';
import * as moment from 'moment';
import * as Immutable from 'immutable';


interface IUniTableSearchOperator {
    verb: string;
    operator: string;
    accepts: UniTableColumnType[];
}

@Component({
    selector: 'unitable-search',
    template: `
        <input class="unitableSearch_input"
            type="search"
            placeholder="Filter"
            [formControl]="basicSearchControl"
        />

        <section #advancedSearchElem class="advanced-search-wrapper">
            <i [matMenuTriggerFor]="advancedDropdown"
                class="material-icons unitable-advanced-search-toggle"
                role="button">
                settings
            </i>

            <mat-menu #advancedDropdown="matMenu" yPosition="below" [overlapTrigger]="false">
                <ul #advancedSearchElem class="unitableSearch_advanced" (click)="$event.stopPropagation()">
                    <li class="section-header">Aktivt søk {{activeSearchName ? '(' + activeSearchName + ')' : ''}}</li>
                    <li class="unitableSearch_advanced_filter" *ngFor="let filter of advancedSearchFilters; let idx = index">

                        <!-- Column select -->
                        <select [(ngModel)]="filter.field" placeholder="Ikke valgt" (ngModelChange)="filterFieldChange(filter)">
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
                        <input type="text" *ngIf="!filter.selectConfig" [(ngModel)]="filter.value" name="filterValue" (ngModelChange)="emitFilters()">

                        <select *ngIf="filter.selectConfig?.options" (ngModelChange)="emitFilters()" [(ngModel)]="filter.value" class="large_select">
                            <option *ngFor="let option of filter.selectConfig.options" [value]="option[filter.selectConfig.valueField]">
                                {{option[filter.selectConfig.displayField]}}
                            </option>
                        </select>

                        <button type="button" (click)="removeFilter(idx, $event)">Fjern</button>
                    </li>

                    <li class="advanced-filter-options">
                        <button class="add-filter" type="button" (click)="newFilter()">Legg til</button>

                        <input type="text" [(ngModel)]="newSearchName" placeholder="Navn på søk" />
                        <button class="good" (click)="saveSearch()">
                            Lagre
                        </button>
                    </li>

                    <li class="section-header section-search" *ngIf="savedSearches?.length">Lagrede søk</li>
                    <li class="unitable-saved-searches" *ngIf="savedSearches?.length">
                        <ul class="saved-search-list">
                            <li *ngFor="let search of savedSearches" (click)="activateSavedSearch(search)">
                                {{search.name}}
                                <span class="delete-search" (click)="removeSavedSearch(search, $event)"></span>
                            </li>
                        </ul>
                    </li>
                </ul>
            </mat-menu>
        </section>
    `
})
// REVISIT: Saving filters needs a serious revisit
// Last minute release stuff..
export class UniTableSearch implements OnChanges {
    @ViewChild('savedSearchesElem') private savedSearchesElement: ElementRef;
    @ViewChild('advancedSearchElem', { static: true }) private advancedSearchElement: ElementRef;

    @Input() public columns: Immutable.List<any>;
    @Input() public tableConfig: IUniTableConfig;
    @Input() public configFilters: ITableFilter[];

    @Output()
    public filtersChange: EventEmitter<any> = new EventEmitter();

    @Output()
    public upOrDownArrows: Subject<KeyboardEvent> = new Subject<KeyboardEvent>();

    public allowGroupFilter: boolean;
    public filterableColumns: Immutable.List<any>;

    public basicSearchControl: FormControl = new FormControl('');

    private basicSearchFilters: ITableFilter[];
    public advancedSearchFilters: ITableFilter[];
    private emitFiltersTimeout: any;

    private tableName: string;

    public savedSearches: ISavedFilter[] = [];
    public activeSearchName: string;
    public newSearchName: string;

    public savedSearchesVisible: boolean;

    public operators: IUniTableSearchOperator[] = [
        {
            'verb': 'inneholder',
            'operator': 'contains',
            'accepts': [
                UniTableColumnType.Text,
                UniTableColumnType.Number
            ]
        },
        {
            'verb': 'begynner med',
            'operator': 'startswith',
            'accepts': [
                UniTableColumnType.Text,
                UniTableColumnType.Number,
                UniTableColumnType.Lookup
            ]
        },
        {
            'verb': 'slutter på',
            'operator': 'endswith',
            'accepts': [
                UniTableColumnType.Text,
                UniTableColumnType.Number,
                UniTableColumnType.Lookup
            ]
        },
        {
            'verb': 'er',
            'operator': 'eq',
            'accepts': [
                UniTableColumnType.Text,
                UniTableColumnType.Number,
                UniTableColumnType.Lookup
            ]
        },
        {
            'verb': 'er ikke',
            'operator': 'ne',
            'accepts': [
                UniTableColumnType.Text,
                UniTableColumnType.Number,
                UniTableColumnType.Lookup
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

    constructor(
        private elementRef: ElementRef,
        private utils: UniTableUtils,
        private cdr: ChangeDetectorRef
    ) {}

    public ngAfterViewInit() {
        this.basicSearchControl.valueChanges
            .debounceTime(250)
            .subscribe((value: string) => {
                this.buildBasicSearchFilter(value);
            });

        fromEvent(this.elementRef.nativeElement.querySelector('input'), 'keydown')
            .filter((event: KeyboardEvent) => {
                const key = (event.keyCode || event.which);
                return key === KeyCodes.UP_ARROW || key === KeyCodes.DOWN_ARROW;
            })
            .subscribe((event: KeyboardEvent) => this.upOrDownArrows.next(event));
    }

    public ngOnChanges(changes) {
        if (changes['configFilters']) {
            this.advancedSearchFilters = this.configFilters;
        }

        if (changes['columns'] && this.columns) {
            let cols = this.columns.filter(x => x.get('sumFunction') == null || x.get('sumFunction') === '').toList();

            if (this.configFilters && this.configFilters.length > 0) {
                let filtersWithoutColumns = this.configFilters.filter(x => !cols.find(y => y.get('field') === x.field));

                filtersWithoutColumns.forEach(f => {
                    cols = cols.push(
                        Immutable.fromJS({
                            header: f.field,
                            field: f.field
                        })
                    );
                });
            }

            this.filterableColumns = cols;
        }

        if (changes['tableConfig'] && this.tableConfig) {
            // Table config changed completely (most likely in ticker changed)
            // Reset everything to make sure we dont have for example
            // invoice filters on a timetracking ticker table
            if (this.tableName && this.tableName !== this.tableConfig.configStoreKey) {
                this.advancedSearchFilters = [];
                this.basicSearchFilters = [];
                this.activeSearchName = undefined;
                this.newSearchName = '';
            }

            this.tableName = this.tableConfig.configStoreKey;
            this.allowGroupFilter = this.tableConfig.allowGroupFilter;

            if (this.tableName) {
                this.savedSearches = this.utils.getFilters(this.tableName);
            }
        }

        if (!this.advancedSearchFilters || this.advancedSearchFilters === []) {
            this.newFilter();
        }
    }

    @HostListener('document:click', ['$event'])
    public checkForClickOutside(event: MouseEvent) {
        if (this.savedSearchesElement && this.savedSearchesVisible) {
            if (!this.savedSearchesElement.nativeElement.contains(event.target)) {
                this.savedSearchesVisible = false;
                this.cdr.markForCheck();
            }
        }
    }

    public saveSearch() {
        if (!this.tableName || !this.savedSearches) {
            return;
        }

        let filters = this.advancedSearchFilters.filter(f => !!f.field && !!f.operator && !!f.value);

        if (!this.advancedSearchFilters || !this.advancedSearchFilters.length) {
            this.newSearchName = '';
            return;
        }

        // If a filter with this name has already been saved
        // update it. If not push a new one to savedFilters
        let existingFilterIndex = this.savedSearches.findIndex(f => f.name === this.newSearchName);
        if (existingFilterIndex >= 0) {
            this.savedSearches[existingFilterIndex].filters = filters;
        } else {
            this.savedSearches.push({
                name: this.newSearchName,
                filters: filters
            });
        }

        this.activeSearchName = this.newSearchName;
        this.utils.saveFilters(this.tableName, this.savedSearches);
    }

    public activateSavedSearch(search: ISavedFilter) {
        if (search && search.filters) {
            this.advancedSearchFilters = search.filters;
            this.emitFilters();

            this.activeSearchName = search.name;
            this.newSearchName = search.name;
            setTimeout(() => this.savedSearchesVisible = false);
        } else {
            this.advancedSearchFilters = [];
            this.basicSearchFilters = [];
            this.activeSearchName = undefined;
            this.newSearchName = '';
            this.emitFilters();
        }
    }

    public removeSavedSearch(search: ISavedFilter, event: MouseEvent) {
        event.stopPropagation();

        if (this.tableName) {
            const index = this.savedSearches.findIndex(f => f.name === search.name);
            this.savedSearches.splice(index, 1);
            this.utils.saveFilters(this.tableName, this.savedSearches);

            if (this.activeSearchName === search.name) {
                this.activeSearchName = '';
                this.newSearchName = '';
                this.advancedSearchFilters = [];
                this.newFilter();
                this.emitFilters();
            }
        }
    }

    public newFilter() {
        if (!this.advancedSearchFilters) {
            this.advancedSearchFilters = [];
        }

        this.advancedSearchFilters.push({
            field: '',
            operator: 'contains',
            value: '',
            group: 0,
            selectConfig: null
        });
    }

    public removeFilter(index: number, event: MouseEvent) {
        event.stopPropagation();
        this.advancedSearchFilters.splice(index, 1);
        this.emitFilters();
    }

    public filterFieldChange(filter: ITableFilter) {
        // some columns are use selects instead of text, e.g. statuscodes, so
        // for those filters, add some options
        let column = this.columns.find(c => c.get('field') === filter.field);

        if (column && column.get('filterSelectConfig') && column.get('filterSelectConfig').options) {
            filter.selectConfig = column.get('filterSelectConfig');
            filter.operator = 'eq';
        } else {
            filter.selectConfig = null;
        }

        this.emitFilters();
    }

    private buildBasicSearchFilter(value) {
        var filters = [];

        this.columns.forEach((column) => {
            let type = column.get('type');

            if (column.get('filterable')
                && !(type === UniTableColumnType.Number && isNaN(value))
                && !(type === UniTableColumnType.Money && isNaN(value))
                && !(type === UniTableColumnType.Percent && isNaN(value))
                && !(type === UniTableColumnType.DateTime && !Date.parse(value))
            ) {
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
                advancedSearchFilters: this.advancedSearchFilters
            });
        }, 250);
    }
}
