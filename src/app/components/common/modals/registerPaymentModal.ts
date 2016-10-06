import {Component, Type, Input, Output, ViewChild, EventEmitter} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {UniForm} from '../../../../framework/uniForm';
import {InvoicePaymentData} from '../../../models/sales/InvoicePaymentData';
import {FieldType} from '../../../unientities';

@Component({
    selector: 'register-payment-form',
    template: `
        <article class='modal-content email-modal' *ngIf="config">
            <h1 *ngIf='config.title'>{{config.title}}</h1>
            <uni-form [config]="formConfig" [fields]="fields" [model]="model" (onChange)="onSubmit($event)" (onSubmit)="onSubmit($event)"></uni-form>
            <footer>
                <button *ngFor='let action of config.actions; let i=index' (click)='action.method()' [ngClass]='action.class' type='button'>
                    {{action.text}}
                </button>
            </footer>
        </article>
    `
})
export class RegisterPaymentForm {
    @Input()
    public config: {};

    @ViewChild(UniForm)
    public form: UniForm;

    @Output()
    public formSubmitted: EventEmitter<InvoicePaymentData> = new EventEmitter<InvoicePaymentData>();

    // TODO: Jorge: I have to use any to hide errors. Don't use any. Use FieldLayout, but respect interface
    public fields: any[];
    public model: InvoicePaymentData = new InvoicePaymentData();
    public formConfig: any = {};

    public ngOnInit() {
        this.fields = [
            {
                ComponentLayoutID: 1,
                EntityType: 'InvoicePaymentData',
                Property: 'PaymentDate',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.DATEPICKER,
                ReadOnly: false,
                LookupField: false,
                Label: 'Betalingsdato',
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
                EntityType: 'InvoicePaymentData',
                Property: 'Amount',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.NUMERIC,
                ReadOnly: false,
                LookupField: false,
                Label: 'Beløp',
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
                ID: 2,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null
            }
        ];
    }

    public onSubmit(invoicePaymentData: InvoicePaymentData) {
        this.formSubmitted.emit(invoicePaymentData);
    }
}

@Component({
    selector: 'register-payment-modal',
    template: `
        <uni-modal [type]='type' [config]='modalConfig'></uni-modal>
    `,
})
export class RegisterPaymentModal {
    @ViewChild(UniModal)
    public modal: UniModal;
    
    @Output()
    public changed: EventEmitter<any> = new EventEmitter<any>();
    @Output()
    public canceled: EventEmitter<boolean> = new EventEmitter<boolean>();

    private modalConfig: any;

    private invoiceID: number;

    public type: Type = RegisterPaymentForm;

    constructor() {
        const self = this;
        self.modalConfig = {
            title: 'Registrer betaling',
            actions: [
                {
                    text: 'Registrer betaling',
                    class: 'good',
                    method: () => {
                        self.modal.getContent().then((form: RegisterPaymentForm) => {
                            self.modal.close();
                            // TODO: changed emitter emits any because emitted object is not InvoicePaymentData                            
                            self.changed.emit({
                                id: self.invoiceID,
                                invoice: form.model
                            });
                        });

                        return false;
                    }
                },
                {
                    text: 'Avbryt',
                    method: () => {
                        self.modal.getContent().then(() => {
                            self.modal.close();
                            self.canceled.emit(true);
                        });

                        return false;
                    }
                }
            ]
        };
    }

    public openModal(invoiceId: number, title: string, invoicePaymentData: InvoicePaymentData) {
        this.invoiceID = invoiceId;
        this.modalConfig.title = title;
        this.modal.getContent().then((form: RegisterPaymentForm) => {
            form.model = invoicePaymentData;
        });
        this.modal.open();
    }
}
