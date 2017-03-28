import {Component, ViewChildren, QueryList} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTable, UniTableColumn, UniTableConfig, UniTableColumnType} from 'unitable-ng2/main';
import {Model} from '../../../unientities';
import {ModelService, ErrorService} from '../../../services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniForm, FieldType, UniField} from 'uniform-ng2/main';
import {UniFieldLayout} from 'uniform-ng2/main';
import {IToolbarConfig} from './../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../framework/save/save';

@Component({
    selector: 'uni-models',
    templateUrl: './models.html'
})
export class UniModels {
    @ViewChildren(UniTable)
    private tables: QueryList<UniTable>;

    private models: Model[];
    private selectedModel: Model;
    private selectedIndex: number;

    private modelsTable: UniTableConfig;
    private fieldsTable: UniTableConfig;

    private hasUnsavedChanges: boolean;

    private formModel$: BehaviorSubject<Model> = new BehaviorSubject(null);
    private formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    private formFields$: BehaviorSubject<UniField[]> = new BehaviorSubject([]);

    private toolbarConfig: IToolbarConfig;
    private saveActions: IUniSaveAction[];

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
            (res) => {
                this.models = res;
                setTimeout(() => {
                    this.tables.first.focusRow(0);
                });
            },
            err => this.errorService.handle(err)
        );

        this.initToolbar();
        this.initTableConfigs();
        this.initFormConfigs();
    }

    private saveCurrentModel() {
        this.modelService.Put(this.selectedModel.ID, this.selectedModel)
            .subscribe(
                res => console.log('save success!'),
                err => this.errorService.handle(err)
            );
    }

    public onRowSelected(event) {
        if (this.hasUnsavedChanges && event.rowModel['_originalIndex'] !== this.selectedModel['_originaIndex']) {
            if (!confirm('Du har ulagrede endringer. Ønsker du å forkaste disse?')) {
                this.tables.first.focusRow(this.selectedModel['_originalIndex']);
            }
        }

        this.hasUnsavedChanges = false;
        this.selectedModel = event.rowModel;
        this.selectedIndex = event.rowModel['_originalIndex'];
        this.formModel$.next(this.selectedModel);
    }

    private onRowChanged(event) {
        this.hasUnsavedChanges = true;
        this.selectedModel.Fields[event._originalIndex] = event.rowModel;
        this.formModel$.next(this.selectedModel);
    }

    public onFormChange(changes) {
        this.hasUnsavedChanges = true;
        this.selectedModel = this.formModel$.getValue();
    }


    private initToolbar() {
        this.toolbarConfig = {
            title: 'Modeller'
        }
        this.saveActions = [{
            label: 'Lagre',
            main: true,
            disabled:false,
            action: (completeCallback) => {
                if(this.selectedModel.ID){

                    this.modelService.Put(this.selectedModel.ID, this.selectedModel).subscribe(
                        (res) => {
                            this.hasUnsavedChanges = false;
                            this.selectedModel = res;
                            this.models[this.selectedIndex] = res;
                            this.models = [...this.models];
                            completeCallback('Model saved');
                        },
                        (err) => {
                            completeCallback('could not save Model');
                            this.errorService.handle(err);
                        }
                    );

                } else{

                    this.modelService.Post(this.selectedModel).subscribe(
                        (res) =>{
                            this.hasUnsavedChanges = false;
                            this.selectedModel = res;
                            completeCallback('model saved');
                        },
                        (err) => {
                            completeCallback('could not save model');
                            this.errorService.handle(err);
                        }
                    );
                }
            }

        }]


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
            ])
            .setChangeCallback(event => this.onRowChanged(event));
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
            }
         ]);
      }
}
