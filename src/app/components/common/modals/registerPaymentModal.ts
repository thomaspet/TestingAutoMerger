import {Component, Type, Output, ViewChild, ComponentRef, EventEmitter} from '@angular/core';
import {NgIf, NgModel, NgFor, NgClass} from '@angular/common';
import {UniModal} from '../../../../framework/modals/modal';
import {UniComponentLoader} from '../../../../framework/core/componentLoader';
import {UniForm, } from '../../../../framework/uniForm';
import {InvoicePaymentData} from '../../../models/sales/InvoicePaymentData';
import {FieldLayout} from "../../../unientities";

@Component({
    selector: 'register-payment-form',
    directives: [UniForm, NgIf],
    template: `
        <uni-form 
            [config]="config"
            [fields]="fields"
            [model]="model" 
            
            (onChange)="onSubmit($event)"
            (onSubmit)="onSubmit($event)"
        ></uni-form>
    `
})
export class RegisterPaymentForm {

    @ViewChild(UniForm)
    public form: UniForm;

    @Output()
    public formSubmitted: EventEmitter<InvoicePaymentData> = new EventEmitter<InvoicePaymentData>();

    // TODO: Jorge: I have to use any to hide errors. Don't use any. Use FieldLayout, but respect interface
    public fields: any[];
    public model: InvoicePaymentData = new InvoicePaymentData();
    public config: any;

    public ngOnInit() {
        this.fields = [
            {
                ComponentLayoutID: 1,
                EntityType: 'InvoicePaymentData',
                Property: 'PaymentDate',
                Placement: 1,
                Hidden: false,
                FieldType: 2,
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
                FieldType: 6,
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

        this.config = {};
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
    directives: [UniModal],
    providers: []
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

    public type: Type = RegisterPaymentModalType;

    constructor() {
        const self = this;
        self.modalConfig = {
            title: 'Registrer betaling',
            actions: [
                {
                    text: 'Registrer betaling',
                    class: 'good',
                    method: () => {
                        self.modal.getContent().then((content: RegisterPaymentModalType) => {
                            content.instance.then((form: RegisterPaymentForm) => {
                                self.modal.close();
                                // TODO: changed emitter emits any because emitted object is not InvoicePaymentData
                                self.changed.emit({
                                    id: self.invoiceID,
                                    invoice: form.model
                                });
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
        this.modal.getContent().then((content: RegisterPaymentModalType) => {
            content.instance.then((form: RegisterPaymentForm) => form.model = invoicePaymentData );
        });
        this.modal.open();
    }
}

@Component({
    selector: 'register-payment-modal-type',
    directives: [NgIf, NgModel, NgFor, NgClass, UniComponentLoader],
    template: `
        <article class='modal-content email-modal'>
            <h1 *ngIf='config.title'>{{config.title}}</h1>
            <uni-component-loader></uni-component-loader>
            <footer>
                <button *ngFor='let action of config.actions; let i=index' (click)='action.method()' [ngClass]='action.class'>
                    {{action.text}}
                </button>
            </footer>
        </article>
    `
})
export class RegisterPaymentModalType {
    @ViewChild(UniComponentLoader)
    private ucl: UniComponentLoader;

    public instance: Promise<RegisterPaymentForm>;

    public ngAfterViewInit() {
        this.ucl.load(RegisterPaymentForm).then((cmp: ComponentRef<any>) => {
            this.instance = new Promise((resolve) => {
                resolve(cmp.instance);
            });
        });
    }
}
