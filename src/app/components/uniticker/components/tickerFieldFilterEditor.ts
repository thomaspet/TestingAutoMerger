import {Component, ViewChild, Input, Output, EventEmitter, SimpleChanges, ChangeDetectionStrategy} from '@angular/core';
import {Ticker, TickerFilter, TickerFieldFilter} from '../../../services/common/uniTickerService';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {FieldType} from 'uniform-ng2/main';
import {UniTickerService} from '../../../services/services';

declare const _; // lodash

@Component({
    selector: 'uni-ticker-field-filter-editor',
    templateUrl: './tickerFieldFilterEditor.html',
    changeDetection: ChangeDetectionStrategy.OnPush
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

    constructor(private uniTickerService: UniTickerService) {
        this.operators = this.uniTickerService.getOperators();
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
            this.entities.push({RelationName: this.mainModel.Name, Model: this.mainModel});

            this.mainModel.RelatedModels.forEach(relatedModel => {
                this.entities.push(relatedModel);
            });

            let selectedModel =
                this.entities.find(x => x.RelationName === this.fieldFilter.Path);

            let modelFields = [];

            if (selectedModel && selectedModel.Model.Fields) {
                let modelFieldNames = Object.getOwnPropertyNames(selectedModel.Model.Fields);
                modelFieldNames.forEach(x => {
                    modelFields.push(selectedModel.Model.Fields[x]);
                });
            }

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
                this.entities.find(x => x.RelationName === this.fieldFilter.Path);

            let modelFields = [];

            if (selectedModel && selectedModel.Model.Fields) {
                let modelFieldNames = Object.getOwnPropertyNames(selectedModel.Model.Fields);
                modelFieldNames.forEach(x => {
                    modelFields.push(selectedModel.Model.Fields[x]);
                });
            }

            this.modelFields = modelFields;
            this.model$.next(this.fieldFilter);
        }

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
                        displayProperty: 'RelationName',
                        valueProperty: 'RelationName',
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
