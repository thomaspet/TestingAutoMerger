import {Component, Type, Input, Output, ViewChild, EventEmitter, OnChanges, SimpleChange} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {UniForm} from '../../../../framework/uniform';
import {Address, FieldType} from '../../../unientities';
import {AddressService} from '../../../services/services';

// Reusable address form
@Component({
    selector: 'address-form',

    template: `
        <article class="modal-content address-modal">
            <h1 *ngIf="config.title">{{config.title}}</h1>
            <uni-form *ngIf="config" [config]="formConfig" [fields]="fields" [model]="config.model"></uni-form>
            <footer>
                <button *ngFor="let action of config.actions; let i=index" (click)="action.method()" [ngClass]="action.class" type="button">
                    {{action.text}}
                </button>
            </footer>
        </article>
    `
})
export class AddressForm implements OnChanges {
    @Input() public model: Address;
    @Input() public question: string;
    @Input() public disableQuestion: boolean;
    @ViewChild(UniForm) public form: UniForm;

    private enableSave: boolean;
    private save: boolean;

    private config: any = {};
    private fields: any[] = [];
    private formConfig: any = {};

    public ngOnInit() {
        this.setupForm();
        this.setupQuestionCheckbox();
    }

    public ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        if (changes['config.disableQuestion'] != null) {
            this.setupForm();
        }
    }

    private setupForm() {
        // TODO get it from the API and move these to backend migrations
        // TODO: turn to 'ComponentLayout when the object respects the interface
        this.fields = [
            {
                ComponentLayoutID: 1,
                EntityType: 'Address',
                Property: 'AddressLine1',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Adresse',
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
                EntityType: 'Address',
                Property: 'AddressLine2',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Adresselinje to',
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
                EntityType: 'Address',
                Property: 'AddressLine3',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Adresselinje tre',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: true,
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
                EntityType: 'Address',
                Property: 'PostalCode',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Postnr.',
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
                EntityType: 'Address',
                Property: 'City',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Poststed',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: true,
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
                EntityType: 'Address',
                Property: 'CountryCode',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Landkode',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: true,
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

    private setupQuestionCheckbox() {
        this.fields.push({
            Property: '_question',
            Hidden: (this.config.question || '').length == 0,
            FieldType: FieldType.MULTISELECT,
            Label: this.config.question,
            ReadOnly: this.config.disableQuestion
        });
    }

}

// address modal
@Component({
    selector: 'address-modal',
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `
})
export class AddressModal {
    @Input() public address: Address;
    @Input() public question: string;
    @ViewChild(UniModal) public modal: UniModal;

    @Output() public Changed = new EventEmitter<Address>();
    @Output() public Canceled = new EventEmitter<boolean>();

    private modalConfig: any = {};
    private type: Type<any> = AddressForm;

    constructor(private addressService: AddressService) {
    }

    public ngOnInit() {
        this.modalConfig = {
            title: 'Adresse',
            mode: null,
            question: this.question,
            disableQuestion: false,

            actions: [
                {
                    text: 'Lagre adresse',
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

    public openModal(address: Address, disableQuestion: boolean = false) {
        this.modalConfig.model = address;
        this.modalConfig.disableQuestion = disableQuestion;
        this.modal.open();
    }
}
