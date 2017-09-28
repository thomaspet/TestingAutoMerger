import {Component, Input, Output, EventEmitter} from '@angular/core';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {
    CompanySettings,
    Account,
    LocalDate,
    InvoicePaymentData
} from '../../../app/unientities';
import {
    CompanySettingsService,
    ErrorService,
    UniSearchAccountConfig,
    CurrencyService,
} from '../../../app/services/services';
import {
    IModalOptions,
    IUniModal,
    UniModalService,
    ConfirmActions
} from '../modalService';
import {UniConfirmModalV2} from './confirmModal';

import {UniMath} from '../../core/uniMath';
import {ToastService, ToastType} from '../../uniToast/toastService';

import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import * as moment from 'moment';

@Component({
    selector: 'uni-register-payment-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1>{{options.header || 'Registrer betaling'}}</h1>
            </header>
            <article>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$"
                    (changEvent)="onFormChange($event)">
                </uni-form>
            </article>

            <footer>
                <button class="good" (click)="close(true)">Registrer betaling</button>
                <button class="bad" (click)="close(false)">Avbryt</button>
            </footer>
        </section>
    `
})
export class UniRegisterPaymentModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Input()
    public modalService: UniModalService;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    private formModel$: BehaviorSubject<any> = new BehaviorSubject(null);
    private formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    private config: any; // typeme
    private companySettings: CompanySettings;
    private isMainCurrency: boolean;
    private paymentCurrencyExchangeRate: number;

    constructor(
        private companySettingsService: CompanySettingsService,
        private errorService: ErrorService,
        private currencyService: CurrencyService,
        private toastService: ToastService,
        private uniSearchAccountConfig: UniSearchAccountConfig
    ) {}

    public ngOnInit() {
        this.config = this.options.modalConfig;
        let paymentData = this.options.data || {};
        this.companySettingsService.Get(1, [
            'AgioGainAccount',
            'AgioLossAccount',
            'BankChargeAccount',
            'BaseCurrencyCode'
        ]).subscribe(
            (settings: CompanySettings) => {
                this.companySettings = settings;
                this.isMainCurrency = settings.BaseCurrencyCodeID === paymentData.CurrencyCodeID;
                this.formFields$.next(this.getFormFields());

                paymentData.BankChargeAccountID = this.companySettings.BankChargeAccountID;

                this.calculateAmount(paymentData).subscribe((result) => {
                    this.calculateAgio(result);
                    this.calculatePaymentCurrencyExchangeRate(result);
                    this.formModel$.next(result);
                });
            },
            err => this.errorService.handle(err)
        );
    }

    public close(emitValue?: boolean) {
        if (!emitValue) {
            this.onClose.emit(undefined);
            return;
        }

        let payment = this.formModel$.getValue();
        let diffCurrencyExchangeRate = Math.abs(
            this.config.currencyExchangeRate - payment.CurrencyExchangeRate
        );

        let diffPercent = UniMath.round(
            (diffCurrencyExchangeRate * 100 / (this.config.currencyExchangeRate || 1)), 2
        );

        if (diffPercent < 15) {
            this.onClose.emit(payment);
            return;
        }

        // Confirm high diff
        const confirmModal = this.modalService.open(UniConfirmModalV2, {
            header: 'Høyt avvik valutakurs',
            message: `Valutakurs for faktura og betaling avviker med ${diffPercent}%, `
                + `er du sikker på at du har registrert riktige tall? Store differanser `
                + `vil kunne føre til høye agioposteringer, i dette tilfellet blir `
                + `agioposteringen på ${this.config.AgioAmount}`,
            buttonLabels: {
                accept: 'Ja, det er riktig',
                reject: 'Avbryt'
            }
        });

        confirmModal.onClose.subscribe((response) => {
            if (response === ConfirmActions.ACCEPT) {
                this.onClose.emit(payment);
            }
        });
    }

    private calculateAmount(paymentData): Observable<InvoicePaymentData> {
        const today = new LocalDate();
        const currencyDate = moment(paymentData.PaymentDate).isAfter(today)
            ? today
            : paymentData.PaymentDate;

        return this.currencyService.getCurrencyExchangeRate(
            paymentData.CurrencyCodeID,
            this.companySettings.BaseCurrencyCodeID,
            currencyDate
        ).switchMap(res => {
            paymentData.Amount = UniMath.round(paymentData.AmountCurrency * res.ExchangeRate);
            return Observable.of(paymentData);
        });
    }

    // COPY PASTE OLD PAYMENT MODAL

    private SetAgioAccount(payment: InvoicePaymentData, previousValue: number): InvoicePaymentData {
        if (payment.AgioAccountID
            && payment.AgioAccountID != this.companySettings.AgioGainAccountID
            && payment.AgioAccountID != this.companySettings.AgioLossAccountID) {
            return payment;
        }

        if (!this.companySettings.AgioGainAccountID || !this.companySettings.AgioLossAccountID) {
            this.toastService.addToast(
                'Agio kontoer ikke satt',
                ToastType.warn,
                0,
                'Du må sette Agio kontoer i firmainnstillingene hvis vi skal sette dette for deg når du fører agio'
            );
        } else if (!payment.AgioAccountID || (Math.sign(payment.AgioAmount) != Math.sign(previousValue))) {
            payment.AgioAccountID = (payment.AgioAmount < 0)
                ? this.companySettings.AgioGainAccountID
                : this.companySettings.AgioLossAccountID;
        }

        return payment;
    }

    private calculateAgio(payment: InvoicePaymentData): InvoicePaymentData {
        const entityName = this.config.entityName;
        if (entityName === 'CustomerInvoice' || (entityName === 'JournalEntryLine' && payment.Amount > 0)) {
            this.calculateAgio4CustomerInvoice(payment);
        } else if (entityName === 'SupplierInvoice' || (entityName === 'JournalEntryLine' && payment.Amount < 0)) {
            this.calculateAgio4SupplierInvoice(payment);
        }

        return payment;
    }

    private calculateAgio4CustomerInvoice(payment: InvoicePaymentData) {
        let previousAgioAmount = payment.AgioAmount;

        let ledgerLineAmount = UniMath.round(
            payment.AmountCurrency * this.config.currencyExchangeRate
        ); // Calculated in the same exchange rate as the invoice

        let agioSmallDeltaAmount = UniMath.round(this.calculateAgio4SmallDeltaPayment(payment));

        payment.AgioAmount = UniMath.round(
            (payment.Amount - payment.BankChargeAmount - ledgerLineAmount + agioSmallDeltaAmount)* -1
        );

        this.SetAgioAccount(payment, previousAgioAmount);
    }

    private calculateAgio4SupplierInvoice(model: InvoicePaymentData) {
        let previousAgioAmount = model.AgioAmount;

        let ledgerLineAmount = UniMath.round(
            model.AmountCurrency * this.config.currencyExchangeRate
        ); // Calculated in the same exchange rate as the invoice

        model.AgioAmount = UniMath.round(
            (-model.Amount + model.BankChargeAmount + ledgerLineAmount) * -1
        );

        this.SetAgioAccount(model, previousAgioAmount);
    }

    private calculatePaymentCurrencyExchangeRate(model: InvoicePaymentData): InvoicePaymentData {
        if (model.Amount && model.AmountCurrency) {
            this.paymentCurrencyExchangeRate = UniMath.round(model.Amount / model.AmountCurrency, 4);
        }
        model.CurrencyExchangeRate = this.config.currencyExchangeRate;
        return model;
    }

    private calculateAgio4SmallDeltaPayment(payment: InvoicePaymentData): number {
        // Only relevant for customer invoice
        let agioAmount = 0;

        // Find the exceptable delta value in currency - based on invoice CurrencyExchangeRate
        var acceptableDelta4CustomerPaymentCurrency = UniMath.round(this.companySettings.AcceptableDelta4CustomerPayment / payment.CurrencyExchangeRate);
        let deltaPaid = UniMath.round(Math.abs(this.config.invoiceRestAmountCurrency - payment.AmountCurrency));

        if (this.config.invoiceRestAmountCurrency > payment.AmountCurrency &&
            deltaPaid <= acceptableDelta4CustomerPaymentCurrency) {
            // Pay LESS then invoice - but within delta
            let delta = UniMath.round(this.config.invoiceRestAmountCurrency - payment.AmountCurrency);
            let ledgerlineAmount = UniMath.round(deltaPaid * this.config.currencyExchangeRate);
            let paymentlineAmount = UniMath.round(deltaPaid * this.paymentCurrencyExchangeRate);
            agioAmount = paymentlineAmount - ledgerlineAmount;
        }

        if (this.config.invoiceRestAmountCurrency < payment.AmountCurrency &&
            deltaPaid <= acceptableDelta4CustomerPaymentCurrency) {
            //Pay MORE then invoice - but within delta
            let delta = UniMath.round(this.config.invoiceRestAmountCurrency - payment.AmountCurrency);
            let ledgerlineAmount = UniMath.round(deltaPaid * this.config.currencyExchangeRate);
            let paymentlineAmount = UniMath.round(deltaPaid * this.paymentCurrencyExchangeRate);
            agioAmount = ledgerlineAmount - paymentlineAmount;
        }
        return UniMath.round(agioAmount);
    }

    public onFormChange(changes): void {
        if (this.isMainCurrency) {
            return;
        }

        let payment: InvoicePaymentData = this.formModel$.getValue();
        if (changes['PaymentDate']) {
            this.calculateAmount(payment).subscribe((result) => {
                this.calculateAgio(result);
                this.formModel$.next(result);
            });
        }

        if (changes['AgioAmount']) {
            this.SetAgioAccount(payment, changes['AgioAmount'].previousValue);
            this.formModel$.next(payment);
        }

        if (changes['Amount'] || changes['AmountCurrency'] || changes['BankChargeAmount']) {
            this.calculatePaymentCurrencyExchangeRate(payment);
            this.calculateAgio(payment);
            this.formModel$.next(payment);
        }
    }

    private getFormFields(): UniFieldLayout[] {
        let fields = [
            <any> {
                EntityType: 'InvoicePaymentData',
                Property: 'PaymentDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Betalingsdato',
            },
            <any> {
                EntityType: 'InvoicePaymentData',
                Property: 'Amount',
                FieldType: FieldType.NUMERIC,
                Label: this.isMainCurrency
                    ? 'Innbetalt beløp'
                    : 'Innbetalt beløp [' + this.companySettings.BaseCurrencyCode.Code + ']',
                Options: {
                    decimalLength: 2,
                    decimalSeparator: ','
                }
            },
            <any> {
                EntityType: 'InvoicePaymentData',
                Property: 'AmountCurrency',
                Hidden: this.isMainCurrency,
                FieldType: FieldType.NUMERIC,
                Label: 'Valutabeløp [' + this.config.currencyCode.Code + ']',
                Options: {
                    decimalLength: 2,
                    decimalSeparator: ','
                }
            },
            <any> {
                EntityType: 'InvoicePaymentData',
                Property: 'AgioAmount',
                Hidden: this.isMainCurrency,
                FieldType: FieldType.NUMERIC,
                Label: 'Agiobeløp [' + this.companySettings.BaseCurrencyCode.Code + ']',
                Sectionheader: '',
                Options: {
                    decimalLength: 2,
                    decimalSeparator: ','
                }
            },
            <any> {
                EntityType: 'InvoicePaymentData',
                Property: 'AgioAccountID',
                Hidden: this.isMainCurrency,
                FieldType: FieldType.UNI_SEARCH,
                Label: 'Konto',
                Placeholder: 'Konto for bilagsføring av agio',
                Options: {
                    uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                    valueProperty: 'ID'
                },
            },
            <any> {
                EntityType: 'InvoicePaymentData',
                Property: 'BankChargeAmount',
                Placement: 1,
                Hidden: this.config.entityName === 'CustomerInvoice',
                FieldType: FieldType.NUMERIC,
                ReadOnly: false,
                LookupField: false,
                Label: this.isMainCurrency
                    ? 'Bankgebyr'
                    : 'Bankgebyr [' + this.companySettings.BaseCurrencyCode.Code + ']',
                Options: {
                    decimalLength: 2,
                    decimalSeparator: ','
                }
            },
            <any> {
                EntityType: 'InvoicePaymentData',
                Property: 'BankChargeAccountID',
                Hidden: this.config.entityName === 'CustomerInvoice',
                FieldType: FieldType.UNI_SEARCH,
                Label: 'Konto',
                Placeholder: 'Konto for bilagsføring av gebyr',
                Options: {
                    uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                    valueProperty: 'ID'
                },
            }
        ];

        return fields;
    }
}
