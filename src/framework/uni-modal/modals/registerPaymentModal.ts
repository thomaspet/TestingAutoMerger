import {Component, Input, Output, EventEmitter} from '@angular/core';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {
    CompanySettings,
    LocalDate,
    InvoicePaymentData,
    Payment,
    BankAccount
} from '../../../app/unientities';
import { CompanySettingsService } from '@app/services/common/companySettingsService';
import { ErrorService } from '@app/services/common/errorService';
import { CurrencyService } from '@app/services/common/currencyService';
import { AccountMandatoryDimensionService} from '@app/services/accounting/accountMandatoryDimensionService';
import { StatisticsService } from '@app/services/common/statisticsService';
import { UniSearchAccountConfig } from '@app/services/common/uniSearchConfig/uniSearchAccountConfig';
import {
    IModalOptions,
    IUniModal,
    ConfirmActions
} from '@uni-framework/uni-modal/interfaces';
import {UniConfirmModalV2} from './confirmModal';

import {UniMath} from '../../core/uniMath';
import {ToastService, ToastType} from '../../uniToast/toastService';

import {BehaviorSubject} from 'rxjs';
import {Observable} from 'rxjs';
import * as moment from 'moment';
import { UniModalService } from '@uni-framework/uni-modal/modalService';
import {UniAccountTypePipe} from '@uni-framework/pipes/uniAccountTypePipe';
import { NumberFormat } from '@app/services/common/numberFormatService';

@Component({
    selector: 'uni-register-payment-modal',
    template: `
        <section role="dialog" class="uni-modal register-payment-modal">
            <header>{{options.header || 'Registrer betaling'}}</header>
            <article>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$"
                    (changeEvent)="onFormChange($event)">
                </uni-form>
                <FONT color="#FF0000">
                    <DIV *ngFor="let message of mandatoryDimensionMessage">{{message}}</DIV>
                </FONT>

                <span class="pay-invoice-message" *ngIf="options?.message"> {{ options.message | translate }} </span>
            </article>
            <footer class="center">
                <button class="secondary" (click)="close(false)">Avbryt</button>
                <button class="c2a" [disabled]="!!isRegisterButtonDisabled" (click)="close(true)"> {{ options?.buttonLabels?.accept || 'Registrer betaling' }} </button>
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
    public formModel$: BehaviorSubject<any> = new BehaviorSubject(null);
    public formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    public mandatoryDimensionMessage: string[] = [];
    private config: any; // typeme
    private companySettings: CompanySettings;
    private isMainCurrency: boolean;
    private paymentCurrencyExchangeRate: number;
    isRegisterButtonDisabled: boolean = false;
    accounts: BankAccount[] = [];

    constructor(
        private companySettingsService: CompanySettingsService,
        private errorService: ErrorService,
        private currencyService: CurrencyService,
        private toastService: ToastService,
        private uniSearchAccountConfig: UniSearchAccountConfig,
        private accountMandatoryDimensionService: AccountMandatoryDimensionService,
        private statisticsService: StatisticsService,
        private numberFormat: NumberFormat,
        private uniAccountTypePipe: UniAccountTypePipe,
    ) {}

    public ngOnInit() {
        this.config = this.options.modalConfig;
        const paymentData = this.options.data || {};

        if (this.config.entityName === 'CustomerInvoice' || this.config.entityName === 'SupplierInvoice' ||
            this.config.entityName === 'JournalEntryLine') {
            Math.abs(UniMath.round(this.config.currencyExchangeRate = (paymentData.Amount / paymentData.AmountCurrency) || 1, 4));
        }

        this.isRegisterButtonDisabled = paymentData.Amount === 0;

        this.companySettingsService.Get(1, [
            'AgioGainAccount',
            'AgioLossAccount',
            'BankChargeAccount',
            'BaseCurrencyCode',
            'CompanyBankAccount',
            'BankAccounts'
        ]).subscribe(
            (settings: CompanySettings) => {
                this.companySettings = settings;
                this.accounts = settings.BankAccounts;
                this.isMainCurrency = settings.BaseCurrencyCodeID === paymentData.CurrencyCodeID;
                this.formFields$.next(this.getFormFields());

                paymentData.BankChargeAccountID = this.companySettings.BankChargeAccountID;

                let msg: string[] = [];

                let filter = '';
                if (this.config.supplierID) { filter = `SupplierID eq ${this.config.supplierID}`; }
                else if (this.config.customerID) { filter = `CustomerID eq ${this.config.customerID}`; }

                if (filter) {
                    this.statisticsService.GetAll(`model=Account&Select=ID&filter=${filter}`).subscribe(res => {
                    const data = (res && res.Data && res.Data[0]) || {};
                    this.accountMandatoryDimensionService.getMandatoryDimensionsReport(data.AccountID, paymentData.DimensionsID)
                        .subscribe(report2 => {
                            if (report2 && report2.MissingRequiredDimensionsMessage !== '') {
                                msg.push(' ! ' +  report2.MissingRequiredDimensionsMessage);
                            }

                            if (this.companySettings.CompanyBankAccount) {
                                this.accountMandatoryDimensionService.getMandatoryDimensionsReport(this.companySettings.CompanyBankAccount.AccountID, paymentData.DimensionsID)
                                    .subscribe((report) => {
                                        if (report && report.MissingRequiredDimensionsMessage !== '') {
                                            msg.push(' ! ' +  report.MissingRequiredDimensionsMessage);
                                        }

                                        if (msg.length > 0) {
                                            this.toastService.addToast(
                                                'Betaling kan ikke registreres før påkrevde dimensjoner er satt, sett nødvendige dimensjoner på fakturahode.', //tslint:disable-line
                                                ToastType.warn, 5
                                            );
                                        }

                                        this.mandatoryDimensionMessage = msg;

                                        if (report && report.RequiredDimensions === [] && report2.RequiredDimensions === []) {
                                            paymentData.DimensionsID = null;
                                        }
                                });
                            } else {
                                this.mandatoryDimensionMessage = msg;
                                if (msg.length > 0) {
                                    this.toastService.addToast(
                                        'Betaling kan ikke registreres før påkrevde dimensjoner er satt, sett nødvendige dimensjoner på fakturahode.',
                                        ToastType.warn, 5
                                    );
                                }
                            }
                        });
                    });
                }

                this.calculateAmount(paymentData).subscribe((result) => {
                    this.calculateAgio(result);
                    this.calculatePaymentCurrencyExchangeRate(result);
                    this.formModel$.next(result);
                });
            },
            err => this.errorService.handle(err)
        );
    }

    ngOnDestroy() {
        this.formConfig$.complete();
        this.formFields$.complete();
        this.formModel$.complete();
    }

    public close(emitValue?: boolean) {
        setTimeout(() => {
            if (this.mandatoryDimensionMessage.length > 0 && emitValue) {
                this.toastService.addToast(
                    'Betaling kan ikke registreres før påkrevde dimensjoner er satt, sett nødvendige dimensjoner på fakturahode.',
                    ToastType.bad, 5
                );
                return;
            }

            if (!emitValue) {
                this.onClose.emit(undefined);
                return;
            }

            const payment: Payment = this.formModel$.getValue();
            payment.CurrencyExchangeRate = this.paymentCurrencyExchangeRate;



            const diffCurrencyExchangeRate = Math.abs(
                (this.config.currencyExchangeRate || 1) - (payment.CurrencyExchangeRate || 1)
            );

            const diffPercent = UniMath.round(
                (diffCurrencyExchangeRate * 100 / (this.config.currencyExchangeRate || 1)), 2
            );

            if (!payment.CurrencyExchangeRate || payment.CurrencyExchangeRate === 1) {
                payment.AmountCurrency = payment.Amount;
                payment.CurrencyExchangeRate = 1;
            }

            if (diffPercent && diffPercent >= 15) {
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
            } else {
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
            // paymentData.Amount = UniMath.round(paymentData.AmountCurrency * res.ExchangeRate, 4);
            return Observable.of(paymentData);
        });
    }

    // COPY PASTE OLD PAYMENT MODAL

    private SetAgioAccount(payment: InvoicePaymentData, previousValue: number): InvoicePaymentData {
        if (payment.AgioAccountID
            && payment.AgioAccountID !== this.companySettings.AgioGainAccountID
            && payment.AgioAccountID !== this.companySettings.AgioLossAccountID) {
            return payment;
        }

        if (!this.companySettings.AgioGainAccountID || !this.companySettings.AgioLossAccountID) {
            this.toastService.addToast(
                'Agio kontoer ikke satt',
                ToastType.warn,
                0,
                'Du må sette Agio kontoer i firmainnstillingene hvis vi skal sette dette for deg når du fører agio'
            );
        } else if (!payment.AgioAccountID || (Math.sign(payment.AgioAmount) !== Math.sign(previousValue))) {
            payment.AgioAccountID = (payment.AgioAmount < 0)
                ? this.companySettings.AgioGainAccountID
                : this.companySettings.AgioLossAccountID;
        }

        return payment;
    }

    private calculateAgio(payment: InvoicePaymentData): InvoicePaymentData {
        const entityName = this.config.entityName;
        if (entityName === 'CustomerInvoice' || this.config.isSupplierInvoice === 1) {
            this.calculateAgio4CustomerInvoice(payment);
        } else if (entityName === 'SupplierInvoice' || this.config.isSupplierInvoice === -1) {
            this.calculateAgio4SupplierInvoice(payment);
        }

        return payment;
    }

    private calculateAgio4CustomerInvoice(payment: InvoicePaymentData) {
        const sign = this.config.isDebit ? 1 : -1;
        const previousAgioAmount = payment.AgioAmount;

        const ledgerLineAmount = UniMath.round(payment.AmountCurrency * this.config.currencyExchangeRate, 2);

        const agioSmallDeltaAmount = UniMath.round(this.calculateAgio4SmallDeltaPayment(payment), 2);
        payment.AgioAmount = UniMath.round(
            (payment.Amount + payment.BankChargeAmount - ledgerLineAmount + agioSmallDeltaAmount) * sign
        , 2);

        this.SetAgioAccount(payment, previousAgioAmount);
    }

    private calculateAgio4SupplierInvoice(model: InvoicePaymentData) {
        const previousAgioAmount = model.AgioAmount;

        const ledgerLineAmount = UniMath.round(
            model.AmountCurrency * this.config.currencyExchangeRate
        ); // Calculated in the same exchange rate as the invoice

        model.AgioAmount = UniMath.round(
            (-model.Amount + model.BankChargeAmount + ledgerLineAmount) * -1
        );

        this.SetAgioAccount(model, previousAgioAmount);
    }

    private calculatePaymentCurrencyExchangeRate(model: InvoicePaymentData): InvoicePaymentData {
        if (model.Amount && model.AmountCurrency) {
            this.paymentCurrencyExchangeRate = UniMath.round((model.Amount - model.BankChargeAmount) / model.AmountCurrency, 4);
        }
        model.CurrencyExchangeRate = this.config.currencyExchangeRate;
        return model;
    }

    private calculateAgio4SmallDeltaPayment(payment: InvoicePaymentData): number {
        // Only relevant for customer invoice
        let agioAmount = 0;

        // Find the exceptable delta value in currency - based on invoice CurrencyExchangeRate
        const acceptableDelta4CustomerPaymentCurrency =
            UniMath.round(this.companySettings.AcceptableDelta4CustomerPayment / payment.CurrencyExchangeRate);
        const deltaPaid = UniMath.round(Math.abs(this.config.invoiceRestAmountCurrency - payment.AmountCurrency));

        if (this.config.invoiceRestAmountCurrency > payment.AmountCurrency &&
            deltaPaid <= acceptableDelta4CustomerPaymentCurrency) {
            // Pay LESS then invoice - but within delta
            const delta = UniMath.round(this.config.invoiceRestAmountCurrency - payment.AmountCurrency);
            const ledgerlineAmount = UniMath.round(deltaPaid * this.config.currencyExchangeRate);
            const paymentlineAmount = UniMath.round(deltaPaid * this.paymentCurrencyExchangeRate);
            agioAmount = paymentlineAmount - ledgerlineAmount;
        }

        if (this.config.invoiceRestAmountCurrency < payment.AmountCurrency &&
            deltaPaid <= acceptableDelta4CustomerPaymentCurrency) {
            // Pay MORE then invoice - but within delta
            const delta = UniMath.round(this.config.invoiceRestAmountCurrency - payment.AmountCurrency);
            const ledgerlineAmount = UniMath.round(deltaPaid * this.config.currencyExchangeRate);
            const paymentlineAmount = UniMath.round(deltaPaid * this.paymentCurrencyExchangeRate);
            agioAmount = ledgerlineAmount - paymentlineAmount;
        }
        return UniMath.round(agioAmount);
    }

    public onFormChange(changes): void {

        const payment: InvoicePaymentData = this.formModel$.getValue();
        this.isRegisterButtonDisabled = !payment.Amount || payment.Amount === 0;

        if (this.isMainCurrency) {
            return;
        }

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
        const paymentLabel = this.config.entityName === 'CustomerInvoice' ? 'Innbetalt'
        : this.config.isSendForPayment ? 'Betal' : 'Betalt';

        const fields = [
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
                    ? paymentLabel
                    : paymentLabel + ' [' + this.companySettings.BaseCurrencyCode.Code + '] inkl. gebyr',
                Options: {
                    decimalLength: 2,
                    decimalSeparator: ','
                }
            },
            <any> {
                EntityType: 'InvoicePaymentData',
                Property: 'FromBankAccountID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Betaling fra konto',
                Hidden: !this.config.isSendForPayment,
                Options: {
                    source: this.accounts,
                    valueProperty: 'ID',
                    template: (item) => {
                        return item?.Label
                            ? (item.Label + ' - ' + this.numberFormat.asBankAcct(item?.AccountNumber))
                            : item?.BankAccountType
                                ? (this.uniAccountTypePipe.transform(item.BankAccountType)
                                    + ' - '
                                    + this.numberFormat.asBankAcct(item?.AccountNumber))
                                : item?.AccountNumber
                                    ? this.numberFormat.asBankAcct(item.AccountNumber)
                                    : '';
                    },
                    debounceTime: 200,
                    hideDeleteButton: true,
                    addEmptyValue: true
                },
            },
            <any> {
                EntityType: 'InvoicePaymentData',
                Property: 'AmountCurrency',
                FieldType: FieldType.NUMERIC,
                Hidden: this.isMainCurrency,
                Label: 'Valutabeløp [' + this.config.currencyCode + ']',
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
                ReadOnly: true,
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
                Hidden: this.isMainCurrency || this.config.hideBankCharges,
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
                Hidden: this.isMainCurrency || this.config.hideBankCharges,
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
