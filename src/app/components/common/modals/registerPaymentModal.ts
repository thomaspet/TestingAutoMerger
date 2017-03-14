import {Component, Type, Input, Output, ViewChild, EventEmitter, SimpleChanges} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {UniForm} from 'uniform-ng2/main';
import {FieldType} from 'uniform-ng2/main';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ConfirmActions} from '../../../../framework/modals/confirm';
import {InvoicePaymentData, CompanySettings, Account, CustomerInvoice, CurrencyCode} from '../../../unientities';
import {CompanySettingsService, ErrorService, AccountService, UniSearchConfigGeneratorService } from '../../../services/services';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'register-payment-form',
    template: `
        <article class='modal-content register-payment-modal' *ngIf="config">
            <h1 *ngIf='config.title'>{{config.title}}</h1>
            <uni-form [config]="formConfig$" [fields]="fields$" [model]="model$" (changeEvent)="onChange($event)"></uni-form>
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

    private bankChargeAccount: Account;
    private companySettings: CompanySettings;
    private isMainCurrency: boolean = false;

    constructor(
        private companySettingsService: CompanySettingsService,
        private errorService: ErrorService,
        private accountService: AccountService,
        private uniSearchConfigGeneratorService: UniSearchConfigGeneratorService) { }

    public ngOnInit() {
        this.companySettingsService.Get(1, ['AgioGainAccount', 'AgioLossAccount', 'BankChargeAccount', 'BaseCurrencyCode'])
            .subscribe((data: CompanySettings) => {
                this.companySettings = data;
                if (this.companySettings.BaseCurrencyCodeID == this.config.model.CurrencyCodeID)
                    this.isMainCurrency = true;

                this.setupForm();
            }, err => this.errorService.handle(err));
        this.model$.next(this.config.model);
    }

    private setupForm() {
        this.fields$.next(this.getFields());
    }

    public onChange(changes: SimpleChanges) {
        if (this.isMainCurrency) return;

        if (changes['AgioAmount']) {
            let model: InvoicePaymentData = this.model$.getValue();
            this.SetAgioAccount(model, changes['AgioAmount'].previousValue);
            this.model$.next(model);
        }
        if (changes['Amount'] || changes['AmountCurrency'] || changes['BankChargeAmount']) {
            let model: InvoicePaymentData = this.model$.getValue();
            this.calculateAgio(model);
            this.model$.next(model);
        }
    }

    private SetAgioAccount(model: InvoicePaymentData, previousValue: number) {
        if (model.AgioAccountID &&
            model.AgioAccountID != this.companySettings.AgioGainAccountID &&
            model.AgioAccountID != this.companySettings.AgioLossAccountID) {
            return;
        }

        if (!model.AgioAccountID || (Math.sign(model.AgioAmount) != Math.sign(previousValue))) {
            if (model.AgioAmount > 0)
                model.AgioAccountID = this.companySettings.AgioGainAccountID;
            else
                model.AgioAccountID = this.companySettings.AgioLossAccountID;
        }
    }

    private calculateAgio(model: InvoicePaymentData) {
        let previousAgioAmount = model.AgioAmount;

        //TODO? Use a service with calculation on backend!!!
        let ledgerLineAmount = model.AmountCurrency * this.config.invoiceCurrencyExchangeRate; //Calculated in the same exchange rate as the invoice

        model.AgioAmount = (-model.Amount + model.BankChargeAmount + ledgerLineAmount) * -1;
        this.SetAgioAccount(model, previousAgioAmount);
    }

    private getFields() {
        return [
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
                EntityType: 'InvoicePaymentData',
                Property: 'Amount',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.NUMERIC,
                ReadOnly: false,
                LookupField: false,
                Label: this.isMainCurrency ? 'Innbetalt beløp' : 'Innbetalt beløp [' + this.companySettings.BaseCurrencyCode.Code + ']',
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
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'InvoicePaymentData',
                Property: 'AmountCurrency',
                Placement: 1,
                Hidden: this.isMainCurrency, //Hide if it is main currency
                FieldType: FieldType.NUMERIC,
                ReadOnly: false,
                LookupField: false,
                Label: 'Valutabeløp [' + this.config.currencyCode.Code + ']',
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
                ID: 2,
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
                Property: 'AgioAmount',
                Placement: 1,
                Hidden: this.isMainCurrency, //Hide if it is main currency
                FieldType: FieldType.NUMERIC, //TODO? Must use TEXT for now since NUMERIC does not fire the change event for negative numbers.
                ReadOnly: false,
                LookupField: false,
                Label: 'Agiobeløp [' + this.companySettings.BaseCurrencyCode.Code + ']',
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
                CustomFields: null,
                Sectionheader: '',
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'InvoicePaymentData',
                Property: 'AgioAccountID',
                Placement: 1,
                Hidden: this.isMainCurrency, //Hide if it is main currency
                FieldType: FieldType.UNI_SEARCH,
                ReadOnly: false,
                LookupField: false,
                Label: 'Konto',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: 'Konto for bilagsføring av agio',
                Options: {
                    uniSearchConfig: this.uniSearchConfigGeneratorService.generate(Account),
                    valueProperty: 'ID'
                },
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
                CustomFields: null,
                Sectionheader: '',
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'InvoicePaymentData',
                Property: 'BankChargeAmount',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.NUMERIC,
                ReadOnly: false,
                LookupField: false,
                Label: this.isMainCurrency ? 'Bankgebyr' : 'Bankgebyr [' + this.companySettings.BaseCurrencyCode.Code + ']',
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
                CustomFields: null,
                Sectionheader: '',
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'InvoicePaymentData',
                Property: 'BankChargeAccountID',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.UNI_SEARCH,
                ReadOnly: false,
                LookupField: false,
                Label: 'Konto',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: 'Konto for bilagsføring av gebyr',
                Options: {
                    uniSearchConfig: this.uniSearchConfigGeneratorService.generate(Account),
                    valueProperty: 'ID'
                },
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
                Sectionheader: '',
            }
        ];
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

    public confirm(invoiceId: number, title: string, currencyCode: CurrencyCode, invoiceCurrencyExchangeRate: number, invoicePaymentData: InvoicePaymentData): Promise<any> {
        return new Promise((resolve, reject) => {
            this.invoiceID = invoiceId;
            this.config.title = title;
            this.config.model = invoicePaymentData;
            this.config.currencyCode = currencyCode;
            this.config.invoiceCurrencyExchangeRate = invoiceCurrencyExchangeRate;

            this.config.actions.accept = {
                text: 'Registrer betaling',
                class: 'good',
                method: () => {
                    resolve({ status: ConfirmActions.ACCEPT, model: this.modal.config.model, id: this.invoiceID });
                    this.modal.close();
                }
            };

            this.config.actions.cancel = {
                text: 'Avbryt',
                method: () => {
                    resolve({ status: ConfirmActions.CANCEL });
                    this.modal.close();
                }
            };

            this.modal.open();
        });
    }
}
