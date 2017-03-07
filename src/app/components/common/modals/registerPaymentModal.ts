import {Component, Type, Input, Output, ViewChild, EventEmitter} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {UniForm} from 'uniform-ng2/main';
import {InvoicePaymentData} from '../../../models/sales/InvoicePaymentData';
import {FieldType} from 'uniform-ng2/main';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ConfirmActions} from '../../../../framework/modals/confirm';

@Component({
    selector: 'register-payment-form',
    template: `
        <article class='modal-content register-payment-modal' *ngIf="config">
            <h1 *ngIf='config.title'>{{config.title}}</h1>
            <uni-form [config]="formConfig$" [fields]="fields$" [model]="model$" (changeEvent)="onSubmit($event)" (submitEvent)="onSubmit($event)"></uni-form>
            <footer>
                <button *ngIf="config?.actions?.accept" (click)="config?.actions?.accept?.method()" class="good">
                    {{config?.actions?.accept?.text}}
                </button>
                <button *ngIf="config?.actions?.cancel" (click)="config?.actions?.cancel?.method()">
                    {{config?.actions?.cancel?.text}}
                </button>
            </footer>
        </article>
    `
})
export class RegisterPaymentForm {
    @Input()
    public config: any = {};

    @ViewChild(UniForm)
    public form: UniForm;

    @Output()
    public formSubmitted: EventEmitter<InvoicePaymentData> = new EventEmitter<InvoicePaymentData>();

    // TODO: Jorge: I have to use any to hide errors. Don't use any. Use FieldLayout, but respect interface
    public model$: BehaviorSubject<any> = new BehaviorSubject(null);
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({});

    public ngOnInit() {
        this.model$.next(this.config.model);
        this.fields$.next([
            {
                ComponentLayoutID: 1,
                EntityType: 'InvoicePaymentData',
                Property: 'PaymentDate',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.LOCAL_DATE_PICKER,
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
        ]);
    }

    public onSubmit(invoicePaymentData: InvoicePaymentData) {
        this.formSubmitted.emit(invoicePaymentData);
    }
}

@Component({
    selector: 'register-payment-modal',
    template: `
        <uni-modal [type]='type' [config]='config' (close)='config?.actions?.cancel?.method()'></uni-modal>
    `,
})
export class RegisterPaymentModal {
    @ViewChild(UniModal)
    public modal: UniModal;

    private config: any;

    private invoiceID: number;

    public type: Type<any> = RegisterPaymentForm;

    constructor() {
        this.config = {
            title: 'Registrer betaling',
            actions: {
                accept: {
                    text: 'Registrer betaling',
                    class: 'good',
                    method: () => { this.modal.close(); }
                },
                cancel: {
                    text: 'Avbryt',
                    method: () => { this.modal.close(); }
                }
            }
        };
    }

    public confirm(invoiceId: number, title: string, invoicePaymentData: InvoicePaymentData): Promise<any> {
        return new Promise((resolve, reject) => {
            this.invoiceID = invoiceId;
            this.config.title = title;
            this.config.model = invoicePaymentData;

            this.config.actions.accept = {
                text: 'Registrer betaling',
                class: 'good',
                method: () => {
                    resolve({status: ConfirmActions.ACCEPT, model: this.modal.config.model, id: this.invoiceID});
                    this.modal.close();
                }
            };

            this.config.actions.cancel = {
                text: 'Avbryt',
                method: () => {
                    resolve({status: ConfirmActions.CANCEL});
                    this.modal.close();
                }
            };

            this.modal.open();
        });
    }
}
