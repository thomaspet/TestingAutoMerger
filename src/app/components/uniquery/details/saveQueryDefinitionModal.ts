import {Component, Type, Input, Output, ViewChild, EventEmitter, OnInit} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {UniQueryDefinition} from '../../../../app/unientities';
import {UniQueryDefinitionService} from '../../../services/services';
import {ToastService} from '../../../../framework/uniToast/toastService';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniForm, FieldType} from '../../../../framework/ui/uniform/index';
import {UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ErrorService} from '../../../services/services';
import {UniHttp} from '../../../../framework/core/http/http';

@Component({
    selector: 'save-query-definition-form',
    template: `
        <article class="modal-content save-query-definition-form">
            <h1 *ngIf="config.title">{{config.title}}</h1>
            <uni-form [config]="formConfig$"
                      [fields]="fields$"
                      [model]="model$"
                      (changeEvent)="change($event)">
            </uni-form>
            <footer>
                <button *ngFor="let action of config.actions; let i=index"
                        (click)="action.method()"
                        [ngClass]="action.class"
                        type="button">
                    {{action.text}}
                </button>
            </footer>
        </article>
    `
})
export class SaveQueryDefinitionForm implements OnInit {
    @Input() public config: any = {};
    @ViewChild(UniForm) public form: UniForm;
    @Output() public querySaved: EventEmitter<any> = new EventEmitter<any>();

    private fields$: BehaviorSubject<Array<any>> = new BehaviorSubject([]);
    private formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    private model$: BehaviorSubject<any> = new BehaviorSubject(null);

    private categories: string[];
    private newCategory: boolean = false;

    constructor(
        private toastService: ToastService, 
        private http: UniHttp, 
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        this.getQueryDefinitionCategoriesAndSetupForm();
    }

    public ngOnChanges() {
        this.model$.next(this.config.model);
    }

    private setupForm() {
        // TODO get it from the API and move these to backend migrations
        // TODO: turn to 'ComponentLayout when the object respects the interface
        this.fields$.next([
            {
                ComponentLayoutID: 1,
                EntityType: 'QueryDefinition',
                Property: 'Name',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Navn',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Legend: '',
                Classes: 'large-field'
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'QueryDefinition',
                Property: 'Category',
                Placement: 1,
                Hidden: this.newCategory,
                FieldType: FieldType.DROPDOWN,
                ReadOnly: false,
                LookupField: false,
                Label: 'Kategori',
                Placeholder: 'F.eks. "Faktura", brukes til gruppering av uttrekk',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Legend: '',
                Classes: 'large-field',
                Options: {
                    source: this.categories,
                    valueProperty: 'name',
                    template: category => category && category.name,
                    debounceTime: 100,
                }
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'QueryDefinition',
                Property: 'Category',
                Placement: 1,
                Hidden: !this.newCategory,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Kategori',
                Placeholder: 'F.eks. "Faktura", brukes til gruppering av uttrekk',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Legend: '',
                Classes: 'large-field'
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'QueryDefinition',
                Property: 'Description',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Beskrivelse',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Legend: '',
                Classes: 'large-field'
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'QueryDefinition',
                Property: 'ClickUrl',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'URL ved klikk',
                Placeholder: 'URL brukeren sendes til, inkludert parametre, f.eks. /sales/customer/:Customer.ID',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 1,
                Sectionheader: 'Avansert',
                Legend: '',
                Classes: 'large-field'
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'QueryDefinition',
                Property: 'ClickParam',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Kolonne som URL parameter',
                Placeholder: 'Kommaseparart liste med navn på felt/kolonne, f.eks. Customer.ID',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 1,
                Sectionheader: 'Avansert',
                Legend: '',
                Classes: 'large-field'
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'QueryDefinition',
                Property: 'ModuleID',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.DROPDOWN,
                ReadOnly: false,
                LookupField: false,
                Label: 'Hvilket skjermbilde den vises på',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 1,
                Sectionheader: 'Avansert',
                Legend: '',
                Classes: 'large-field',
                Options: {
                    source: Object.keys(UniModules)
                        .map(key => +key)
                        .filter(key => key >= 0)
                        .map(key => ({id: key, name: UniModules[key]})),
                    displayProperty: 'name',
                    valueProperty: 'id'
                }
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'QueryDefinition',
                Property: 'IsShared',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.CHECKBOX,
                ReadOnly: false,
                LookupField: false,
                Label: 'Delt uttrekk',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 1,
                Sectionheader: 'Avansert',
                Legend: ''
            }
        ]);
    }

    private getQueryDefinitionCategoriesAndSetupForm() {
        this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint('uniquerydefinitions?action=get-distinct-querydefinition-categories')
            .send().map(response => response.json())
            .subscribe(
                result => {
                    this.categories = this.transformArray(result);
                    this.model$.next(this.config.model);
                    this.setupForm();
                },
                error => this.errorService.handle(error)
            );
    }

    private transformArray(data) {
        const newData = [];
        newData.push({name: 'Legg til ny...'});
        data.forEach(x => newData.push({name: x}));
        return newData;
    }

    private change(data) {
        if (data.Category && data.Category.currentValue === 'Legg til ny...') {
            this.newCategory = true;
            this.model$.value.Category = '';
            this.setupForm();
        }
    }
}

@Component({
    selector: 'save-query-definition-modal',
    template: `
        <uni-modal *ngIf="modalConfig" [type]="type" [config]="modalConfig"></uni-modal>
    `
})
export class SaveQueryDefinitionModal {
    @ViewChild(UniModal) public modal: UniModal;

    @Output() public saved: EventEmitter<UniQueryDefinition> = new EventEmitter<UniQueryDefinition>();
    @Output() public cancelled: EventEmitter<any> = new EventEmitter<boolean>();

    private modalConfig: any = {};
    public type: Type<any> = SaveQueryDefinitionForm;

    constructor(
        private toastService: ToastService,
        private uniQueryDefinitionService: UniQueryDefinitionService,
        private errorService: ErrorService
    ) {
        this.modalConfig = {
            title: 'Lagre uttrekk',
            mode: null,
            disableQuestion: false,

            actions: [
                {
                    text: 'Lagre uttrekk',
                    class: 'good',
                    method: () => {
                        let model: UniQueryDefinition = this.modalConfig.model;

                        let obs: Observable<any> = model.ID !== 0 ?
                            this.uniQueryDefinitionService.Put(model.ID, model)
                            : this.uniQueryDefinitionService.Post(model);

                        obs.subscribe((res) => {
                                this.modal.close();
                                this.saved.emit(res);
                                return false;
                            },
                        err => this.errorService.handle(err));
                    }
                },
                {
                    text: 'Avbryt',
                    method: () => {
                        this.modal.close();
                        this.cancelled.emit(true);
                        return false;
                    }
                }
            ]
        };
    }

    public openModal(query: UniQueryDefinition, saveAs: boolean) {
        if (this.modal) {
            this.modalConfig.model = query;

            if (saveAs) {
                this.modalConfig.title = 'Lagre som nytt uttrekk';
            } else {
                this.modalConfig.title = 'Lagre uttrekk';
            }

            this.modal.open();
        }
    }
}
