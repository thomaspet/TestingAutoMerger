import {Component} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTable, UniTableColumn, UniTableConfig, UniTableColumnType} from 'unitable-ng2/main';
import {Model} from '../../../unientities';
import {ModelService, ErrorService} from '../../../services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniForm, FieldType, UniField} from 'uniform-ng2/main';
import {UniFieldLayout} from 'uniform-ng2/main';

@Component({
    selector: 'uni-models',
    templateUrl: 'app/components/admin/models/models.html'
})
export class UniModels {
    private models: Model[];
    private selectedModel: Model;
    private modelFields: any[];

    private modelsTable: UniTableConfig;
    private fieldsTable: UniTableConfig;


    private formModel$: BehaviorSubject<Model> = new BehaviorSubject(null);
    private formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    private formFields$: BehaviorSubject<UniField[]> = new BehaviorSubject([]);

    constructor(
        private tabService: TabService,
        private modelService: ModelService,
        private errorService: ErrorService
    ) {
        this.tabService.addTab({
            name: 'Modeller',
            url: '/admin/models',
            moduleID: UniModules.Models,
            active: true
        });

        this.modelService.GetAll(null).subscribe(
            res => this.models = res,
            err => this.errorService.handle(err)
        );

        this.initTableConfigs();
        this.initFormConfigs();
    }

    public onRowSelected(event) {
        this.selectedModel = event.rowModel;
        console.log(this.selectedModel.Fields)
        if (this.selectedModel.Fields) {
            this.modelFields = this.selectedModel.Fields;
        }
    }


    private initTableConfigs() {
        this.modelsTable = new UniTableConfig(false, true, 15)
            .setSearchable(true)
            .setColumns([new UniTableColumn('Name')]);

        this.fieldsTable = new UniTableConfig(true)
            .setColumns([
                new UniTableColumn('Name', 'Navn', UniTableColumnType.Text, false),
                new UniTableColumn('Label', 'Label'),
                new UniTableColumn('Description', 'Beskrivelse'),
                new UniTableColumn('HelpText', 'Hjelpetekst')
            ]);
    }

    private initFormConfigs() {
        this.formConfig$.next({});
        this.formFields$.next([
            <any> {
                ComponentLayoutID: 1,
                EntityType: 'Model',
                Property: 'Label',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Label',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: '',
                hasLineBreak: false,
                Validations: []
            },
            <any>{
                ComponentLayoutID: 1,
                EntityType: 'Model',
                Property: 'LabelPlural',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Label plural',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: '',
                hasLineBreak: false,
                Validations: []
            },
            <any>{
                ComponentLayoutID: 1,
                EntityType: 'Model',
                Property: 'Description',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXTAREA,
                ReadOnly: false,
                LookupField: false,
                Label: 'Description',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: '',
                hasLineBreak: false,
                Validations: []
            },
            <any>{
                ComponentLayoutID: 1,
                EntityType: 'Model',
                Property: 'HelpText',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXTAREA,
                ReadOnly: false,
                LookupField: false,
                Label: 'HelpText',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: '',
                hasLineBreak: false,
                Validations: []
            }

        ]);
    }

    private onFormChange(event) {
        console.log(event);
    }
}
