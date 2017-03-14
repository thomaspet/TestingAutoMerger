import {Component, ViewChild, Input, Output, EventEmitter, SimpleChanges} from '@angular/core';
import {Ticker, TickerFilter, TickerFieldFilter} from '../../../services/common/uniTickerService';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {FieldType} from 'uniform-ng2/main';

declare const _; // lodash

@Component({
    selector: 'uni-ticker-field-filter-editor',
    templateUrl: './tickerFieldFilterEditor.html'
})
export class UniTickerFieldFilterEditor {
    @Input() private ticker: Ticker;
    @Input() private fieldFilter: TickerFieldFilter;
    @Input() private mainModel: any;

    @Output() private fieldFilterChanged: EventEmitter<TickerFieldFilter> = new EventEmitter<TickerFieldFilter>();
    @Output() private fieldFilterDeleted: EventEmitter<TickerFieldFilter> = new EventEmitter<TickerFieldFilter>();

    private groupedFieldFilters: Array<GroupedFieldFilter> = [];

    private model$: BehaviorSubject<any> = new BehaviorSubject(this.fieldFilter);
    private config$: BehaviorSubject<any> = new BehaviorSubject({});
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    private entities: Array<any> = [];
    private modelFields: Array<any> = [];

    private operators: any[] = [];

    constructor() {
        this.operators = this.getOperators();
    }

    private ngOnChanges(changes: SimpleChanges) {
        if (changes['fieldFilter']) {
            this.model$.next(this.fieldFilter);

            if (!this.fieldFilter.Path) {
                this.fieldFilter.Path = this.ticker.Model;
            }

            this.entities.push({Name: this.fieldFilter.Path});

            if (this.fieldFilter.Field) {
                this.modelFields.push({Publicname: this.fieldFilter.Field});
            }
        }

        if (changes['mainModel']) {

            this.entities = [];
            this.entities.push(this.mainModel);

            this.mainModel.RelatedModels.forEach(relatedModel => {
                this.entities.push(relatedModel);
            });

            let selectedModel =
                this.entities.find(x => x.Name === this.fieldFilter.Path || x.Name === this.fieldFilter.Path);

            let modelFieldNames = Object.getOwnPropertyNames(selectedModel.Fields);
            let modelFields = [];
            modelFieldNames.forEach(x => {
                modelFields.push(selectedModel.Fields[x]);
            });

            if (!modelFields.find(x => x.Publicname === this.fieldFilter.Field)) {
                this.fieldFilter.Field = '';
            }

            this.modelFields = modelFields;
        }

        this.fields$.next(this.getLayout().Fields);
    }

    private deleteFieldFilter() {
        this.fieldFilterDeleted.emit(this.fieldFilter);
    }

    private onFieldFilterChange(changes: SimpleChanges) {
        if (changes['Path']) {
            let selectedModel =
                this.entities.find(x => x.Name === this.fieldFilter.Path || x.Name === this.fieldFilter.Path);

            let modelFieldNames = Object.getOwnPropertyNames(selectedModel.Fields);
            let modelFields = [];
            modelFieldNames.forEach(x => {
                modelFields.push(selectedModel.Fields[x]);
            });
            this.modelFields = modelFields;
            this.model$.next(this.fieldFilter);
        }

        this.fieldFilterChanged.emit(this.fieldFilter);
    }

    private fieldSelected(fieldFilter, event) {
        fieldFilter.Model = event;
    }

    private getOperators() {
        return [
            {
                'verb': 'inneholder',
                'operator': 'contains',
                'accepts': [
                    'Text',
                    'Number'
                ]
            },
            {
                'verb': 'begynner med',
                'operator': 'startswith',
                'accepts': [
                    'Text',
                    'Number'
                ]
            },
            {
                'verb': 'slutter på',
                'operator': 'endswith',
                'accepts': [
                    'Text',
                    'Number'
                ]
            },
            {
                'verb': 'er',
                'operator': 'eq',
                'accepts': [
                    'Text',
                    'Number'
                ]
            },
            {
                'verb': 'er ikke',
                'operator': 'ne',
                'accepts': [
                    'Text',
                    'Number'
                ]
            },
            {
                'verb': 'er større enn',
                'operator': 'gt',
                'accepts': [
                    'Number',
                    'DateTime'
                ]
            },
            {
                'verb': 'er større el. lik',
                'operator': 'ge',
                'accepts': [
                    'Number',
                    'DateTime'
                ]
            },
            {
                'verb': 'er mindre enn',
                'operator': 'lt',
                'accepts': [
                    'Number',
                    'DateTime'
                ]
            },
            {
                'verb': 'er mindre el. lik',
                'operator': 'le',
                'accepts': [
                    'Number',
                    'DateTime'
                ]
            }
        ];
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
                    Property: 'Path',
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
                        source: this.entities,
                        displayProperty: 'Name',
                        valueProperty: 'Name',
                        debounceTime: 200
                    },
                    Classes: 'field-select'
                },
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
                        source: this.modelFields,
                        displayProperty: 'Publicname',
                        valueProperty: 'Publicname',
                        debounceTime: 200
                    },
                    Classes: 'field-select'
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
