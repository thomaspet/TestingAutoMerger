import {Component, ViewChild, Input, Output, EventEmitter, SimpleChanges, ChangeDetectionStrategy} from '@angular/core';
import {Ticker, TickerFilter, TickerFieldFilter} from '../../../services/common/uniTickerService';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {FieldType} from 'uniform-ng2/main';
import {UniTickerService} from '../../../services/services';

declare const _; // lodash

@Component({
    selector: 'uni-ticker-field-filter-editor-simple',
    templateUrl: './tickerFieldFilterEditorSimple.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTickerFieldFilterEditorSimple {
    @Input() private ticker: Ticker;
    @Input() private fieldFilter: TickerFieldFilter;

    @Output() private fieldFilterChanged: EventEmitter<TickerFieldFilter> = new EventEmitter<TickerFieldFilter>();
    @Output() private fieldFilterDeleted: EventEmitter<TickerFieldFilter> = new EventEmitter<TickerFieldFilter>();

    private model$: BehaviorSubject<any> = new BehaviorSubject(this.fieldFilter);
    private config$: BehaviorSubject<any> = new BehaviorSubject({});
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    private filterableColumns: Array<any> = [];
    private operators: any[] = [];

    constructor(private uniTickerService: UniTickerService) {
        this.operators = this.uniTickerService.getOperators();
    }

    private ngOnChanges(changes: SimpleChanges) {


        if (changes['fieldFilter']) {
            this.model$.next(this.fieldFilter);
        }

        if (this.ticker) {
            this.filterableColumns = this.ticker.Columns;
            this.fields$.next(this.getLayout().Fields);
        }
    }

    private deleteFieldFilter() {
        this.fieldFilterDeleted.emit(this.fieldFilter);
    }

    private onFieldFilterChange(changes: SimpleChanges) {
        this.fieldFilterChanged.emit(this.fieldFilter);
    }

    private fieldSelected(fieldFilter, event) {
        fieldFilter.Model = event;
    }

    private getLayout() {
        return {
            Name: 'TransqueryList',
            BaseEntity: 'Account',
            StatusCode: 0,
            Deleted: false,
            CreatedAt: null,
            UpdatedAt: null,
            CreatedBy: null,
            UpdatedBy: null,
            ID: 1,
            CustomFields: null,
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: 'TickerFieldFilter',
                    Property: 'Field',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: '',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 1,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null,
                    Options: {
                        source: this.filterableColumns,
                        displayProperty: 'Header',
                        valueProperty: 'SelectableFieldName',
                        debounceTime: 200
                    },
                    Classes: 'filter-field-select'
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'TickerFieldFilter',
                    Property: 'Operator',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: '',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: 'Velg søkefelt...',
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 1,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null,
                    Options: {
                        source: this.operators,
                        displayProperty: 'verb',
                        valueProperty: 'operator',
                        debounceTime: 200
                    },
                    Classes: 'operator-select'
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'TickerFieldFilter',
                    Property: 'Value',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: '',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 1,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null,
                    Options: null
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'TickerFieldFilter',
                    Property: 'Deleted',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.BUTTON,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Slett',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: 'Søkefilter...',
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 1,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null,
                    Options: {
                        click: () => this.deleteFieldFilter()
                    },
                    Classes: 'delete-button'
                }
            ]
        };
    }
}

export class GroupedFieldFilter {
    public QueryGroup: number;
    public FieldFilters: Array<TickerFieldFilter>;
}
