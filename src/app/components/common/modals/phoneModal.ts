import {Component, Type, Input, Output, ViewChild, EventEmitter} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {UniForm, UniFieldLayout} from '../../../../framework/uniform';
import {Phone} from '../../../unientities';
import {PhoneService} from '../../../services/services';

// Reusable address form
@Component({
    selector: 'phone-form',
    directives: [UniForm],
    template: `
        <article class="modal-content phone-modal">
            <h1 *ngIf="config.title">{{config.title}}</h1>
            <uni-form [config]="formConfig" [fields]="fields" [model]="config.model"></uni-form>
            <footer>
                <button *ngFor="let action of config.actions; let i=index" (click)="action.method()" [ngClass]="action.class" type="button">
                    {{action.text}}
                </button>
            </footer>
        </article>
    `
})
export class PhoneForm {
    @ViewChild(UniForm) public form: UniForm;
    private config: any = {};
    private fields: any[] = [];
    public formConfig: any = {};

    public ngOnInit() {
        this.setupForm();
        this.extendFormConfig();
    }

    private setupForm() {
        // TODO get it from the API and move these to backend migrations
        // TODO: turn to 'ComponentLayout when the object respects the interface
       this.fields = [
            {
                ComponentLayoutID: 1,
                EntityType: 'Phone',
                Property: 'CountryCode',
                Placement: 1,
                Hidden: false,
                FieldType: 10,
                ReadOnly: false,
                LookupField: false,
                Label: 'Landskode',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
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
                CustomFields: null
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'Phone',
                Property: 'Number',
                Placement: 1,
                Hidden: false,
                FieldType: 10,
                ReadOnly: false,
                LookupField: false,
                Label: 'Telefonnr.',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
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
                CustomFields: null
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'Phone',
                Property: 'Description',
                Placement: 1,
                Hidden: false,
                FieldType: 10,
                ReadOnly: false,
                LookupField: false,
                Label: 'Beskrivelse',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
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
                CustomFields: null
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'Phone',
                Property: 'Type',
                Placement: 1,
                Hidden: false,
                FieldType: 3,
                ReadOnly: false,
                LookupField: false,
                Label: 'Type',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
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
                CustomFields: null
            }
        ];
    }

    private extendFormConfig() {
        var typeField: UniFieldLayout = this.fields.find(x => x.Property === 'Type');

        typeField.Options = {
            source:  [
                {ID: 150101, Name: 'Telefon'},
                {ID: 150102, Name: 'Mobil' },
                {ID: 150103, Name: 'Fax'}
            ],
            valueProperty: 'ID',
            displayProperty: 'Name'
        };
    }
}

// phone modal
@Component({
    selector: 'phone-modal',
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `,
    directives: [UniModal],
    providers: [PhoneService]
})
export class PhoneModal {
    @Input() public phone: Phone;
    @ViewChild(UniModal) public modal: UniModal;

    @Output() public Changed = new EventEmitter<Phone>();
    @Output() public Canceled = new EventEmitter<boolean>();

    private modalConfig: any = {};
    private type: Type = PhoneForm;

    constructor(private phoneService: PhoneService) {
    }

    public ngOnInit() {
        this.modalConfig = {
            title: 'Telefonnummer',
            model: this.phone,

            actions: [
                {
                    text: 'Lagre nummer',
                    class: 'good',
                     method: () => {
                        this.modal.close();
                        this.Changed.emit(this.modalConfig.model);
                        return false;
                    }
                },
                {
                    text: 'Avbryt',
                    method: () => {
                        this.modal.close();
                        this.Canceled.emit(true);
                        return false;
                    }
                }
            ]
        };
    }

    public openModal(phone: Phone) {
        this.modalConfig.model = phone;
        this.modal.open();
    }
}
