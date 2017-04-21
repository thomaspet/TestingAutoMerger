import {Component, Type, Input, Output, ViewChild, EventEmitter, SimpleChanges} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {UniForm, FieldType} from 'uniform-ng2/main';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ConfirmActions} from '../../../../framework/modals/confirm';
import {InvoicePaymentData, CompanySettings, Account, CurrencyCode, LocalDate} from '../../../unientities';
import {
    CompanySettingsService,
    ErrorService,
    UniSearchConfigGeneratorService,
    CurrencyService
} from '../../../services/services';
import * as moment from 'moment';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {UniMath} from '../../../../framework/core/uniMath';

export interface RegisterPaymentModalResult {
    status: ConfirmActions;
    model: InvoicePaymentData;
    id: Number;
};


@Component({
    selector: 'register-payment-form',
    template: `
        <article class='modal-content register-payment-modal' *ngIf="config">
            <h1 *ngIf='config.title'>{{config.title}}</h1>
            <uni-form [config]="formConfig$" [fields]="fields$" [model]="model$" (changeEvent)="onChange($event)"></uni-form>
            <span *ngIf='config.invoiceCurrencyExchangeRate && !isMainCurrency'>
                <table class="invoice-currency-table">
                    <tr>
                        <td>Faktura-valutakurs:</td>
                        <td>{{config.invoiceCurrencyExchangeRate}}</td>
                    </tr>
                    <tr *ngIf="paymentCurrencyExchangeRate">
                        <td>Betaling-valutakurs:</td>
                        <td>{{paymentCurrencyExchangeRate}}</td>
                    </tr>
                </table>
            </span>

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

    private companySettings: CompanySettings;
    private isMainCurrency: boolean = false;
    private paymentCurrencyExchangeRate: number;

    constructor(
        private companySettingsService: CompanySettingsService,
        private errorService: ErrorService,
        private uniSearchConfigGeneratorService: UniSearchConfigGeneratorService,
        private currencyService: CurrencyService,
        private toastService: ToastService
    ) { }

    public ngOnInit() {
        this.companySettingsService.Get(1, ['AgioGainAccount', 'AgioLossAccount', 'BankChargeAccount', 'BaseCurrencyCode'])
            .subscribe((data: CompanySettings) => {
                this.companySettings = data;
                if (this.companySettings.BaseCurrencyCodeID == this.config.model.CurrencyCodeID) {
                    this.isMainCurrency = true;
                }

                this.config.model.BankChargeAccountID = this.companySettings.BankChargeAccountID;
                this.setupForm();
                this.paymentCurrencyExchangeRate = this.config.invoiceCurrencyExchangeRate;

                this.calculateAmount(this.config.model)
                    .then(model => this.calculateAgio(model))
                    .then(model => this.calculatePaymentCurrencyExchangeRate(model))
                    .then(model => this.model$.next(model));

            }, err => this.errorService.handle(err));
    }

    private setupForm() {
        this.fields$.next(this.getFields());
    }

    public onChange(changes: SimpleChanges) {
        if (this.isMainCurrency) return;
        if (changes['PaymentDate']) {
            let model: InvoicePaymentData = this.model$.getValue();
            this.calculateAmount(model)
                .then(model => this.calculateAgio(model))
                .then(model => this.model$.next(model));
        }
        if (changes['AgioAmount']) {
            let model: InvoicePaymentData = this.model$.getValue();
            this.SetAgioAccount(model, changes['AgioAmount'].previousValue);
            this.model$.next(model);
        }
        if (changes['Amount'] || changes['AmountCurrency'] || changes['BankChargeAmount']) {
            let model: InvoicePaymentData = this.model$.getValue();
            this.calculatePaymentCurrencyExchangeRate(model);
            this.calculateAgio(model);
            this.model$.next(model);
        }

    }

    private SetAgioAccount(model: InvoicePaymentData, previousValue: number): InvoicePaymentData {
        if (model.AgioAccountID &&
            model.AgioAccountID != this.companySettings.AgioGainAccountID &&
            model.AgioAccountID != this.companySettings.AgioLossAccountID) {
            return model;
        }

        if (!this.companySettings.AgioGainAccountID || !this.companySettings.AgioLossAccountID) {
            this.toastService.addToast(
                'Agio kontoer ikke satt',
                ToastType.warn,
                0,
                'Du må sette Agio kontoer i firmainnstillingene hvis vi skal sette dette for deg når du fører agio'
            );
        } else if (!model.AgioAccountID || (Math.sign(model.AgioAmount) != Math.sign(previousValue))) {
            if (model.AgioAmount < 0)
                model.AgioAccountID = this.companySettings.AgioGainAccountID;
            else
                model.AgioAccountID = this.companySettings.AgioLossAccountID;
        }
        return model;
    }

    private calculateAmount(model: InvoicePaymentData): Promise<InvoicePaymentData> {
        const today = new LocalDate();
        const currencyDate = moment(model.PaymentDate).isAfter(today) ? today : model.PaymentDate;
        return this.currencyService.getCurrencyExchangeRate(
            model.CurrencyCodeID,
            this.companySettings.BaseCurrencyCodeID,
            currencyDate
        )
            .map(e => e.ExchangeRate)
            .catch(err => this.errorService.handle(err))
            .toPromise()
            .then(exchangeRate => {
                model.Amount = UniMath.round(model.AmountCurrency * exchangeRate);
                return model;
            });
    }

    private calculateAgio(model: InvoicePaymentData): InvoicePaymentData {
        if (this.config.entityName === 'CustomerInvoice') {
            this.calculateAgio4CustomerInvoice(model);
        }
        else
            this.calculateAgio4SupplierInvoice(model);
        return model;
    }

    private calculateAgio4CustomerInvoice(model: InvoicePaymentData) {
        let previousAgioAmount = model.AgioAmount;

        let ledgerLineAmount = UniMath.round(model.AmountCurrency * this.config.invoiceCurrencyExchangeRate); //Calculated in the same exchange rate as the invoice
        let agioSmallDeltaAmount = UniMath.round(this.calculateAgio4SmallDeltaPayment(model));

        model.AgioAmount = UniMath.round((model.Amount - model.BankChargeAmount - ledgerLineAmount + agioSmallDeltaAmount) * -1);
        this.SetAgioAccount(model, previousAgioAmount);
    }

    private calculateAgio4SupplierInvoice(model: InvoicePaymentData) {
        let previousAgioAmount = model.AgioAmount;

        let ledgerLineAmount = UniMath.round(model.AmountCurrency * this.config.invoiceCurrencyExchangeRate); //Calculated in the same exchange rate as the invoice
        model.AgioAmount = UniMath.round((-model.Amount + model.BankChargeAmount + ledgerLineAmount) * -1);
        this.SetAgioAccount(model, previousAgioAmount);
    }
    private calculatePaymentCurrencyExchangeRate(model: InvoicePaymentData): InvoicePaymentData {
        if (model.Amount && model.AmountCurrency) {
            this.paymentCurrencyExchangeRate = UniMath.round(model.Amount / model.AmountCurrency, 4);
        }
        model.CurrencyExchangeRate = this.paymentCurrencyExchangeRate;
        return model;
    }

    private calculateAgio4SmallDeltaPayment(model: InvoicePaymentData):number {
        //Only relevant for customer invoice
        let agioAmount = 0;

        //Find the exceptable delta value in currency - based on invoice CurrencyExchangeRate
        var acceptableDelta4CustomerPaymentCurrency = UniMath.round(this.companySettings.AcceptableDelta4CustomerPayment / model.CurrencyExchangeRate);
        let deltaPaid = UniMath.round(Math.abs(this.config.invoiceRestAmountCurrency - model.AmountCurrency));

        if (this.config.invoiceRestAmountCurrency > model.AmountCurrency &&
            deltaPaid <= acceptableDelta4CustomerPaymentCurrency) {
            //Pay LESS then invoice - but within delta
            let delta = UniMath.round(this.config.invoiceRestAmountCurrency - model.AmountCurrency);
            let ledgerlineAmount = UniMath.round(deltaPaid * this.config.invoiceCurrencyExchangeRate);
            let paymentlineAmount = UniMath.round(deltaPaid * this.paymentCurrencyExchangeRate);
            agioAmount = paymentlineAmount - ledgerlineAmount;
        }

        if (this.config.invoiceRestAmountCurrency < model.AmountCurrency &&
            deltaPaid <= acceptableDelta4CustomerPaymentCurrency) {
            //Pay MORE then invoice - but within delta
            let delta = UniMath.round(this.config.invoiceRestAmountCurrency - model.AmountCurrency);
            let ledgerlineAmount = UniMath.round(deltaPaid * this.config.invoiceCurrencyExchangeRate);
            let paymentlineAmount = UniMath.round(deltaPaid * this.paymentCurrencyExchangeRate);
            agioAmount = ledgerlineAmount - paymentlineAmount;
        }
        return UniMath.round(agioAmount);
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
                Hidden: this.config.entityName === 'CustomerInvoice', //Hide if invoice is CustomerInvoice
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
                Hidden: this.config.entityName === 'CustomerInvoice', //Hide if invoice is CustomerInvoice,
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

    public confirm(invoiceId: number, title: string, currencyCode: CurrencyCode, invoiceCurrencyExchangeRate: number,
        entityName: string, invoicePaymentData: InvoicePaymentData): Promise<RegisterPaymentModalResult> {
        return new Promise(resolve => {

            this.invoiceID = invoiceId;
            this.config.title = title;
            this.config.model = invoicePaymentData;
            this.config.currencyCode = currencyCode;
            this.config.invoiceCurrencyExchangeRate = invoiceCurrencyExchangeRate;
            this.config.entityName = entityName;
            this.config.invoiceRestAmountCurrency = invoicePaymentData.AmountCurrency;

            this.config.actions.accept = {
                text: 'Registrer betaling',
                class: 'good',
                method: () => {
                    resolve({ status: ConfirmActions.ACCEPT, model: this.config.model, id: this.invoiceID });
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
