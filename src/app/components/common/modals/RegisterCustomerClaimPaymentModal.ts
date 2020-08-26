import { Component, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { IUniModal, IModalOptions } from '../../../../framework/uni-modal';
import { UniForm, FieldType } from '../../../../framework/ui/uniform/index';

import { BehaviorSubject, Observable } from 'rxjs';
import { BankAccountService, CompanySettingsService, PaymentBatchService, PaymentService } from '@app/services/services';
import { CompanySettings, Payment, JournalEntryLine } from '@uni-entities';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import { RequestMethod } from '@uni-framework/core/http';
@Component({
    selector: 'register-payment-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>{{options?.header||'Registrer tilbakebetaling'}}</header>

            <article>
                <section *ngIf="busy" class="modal-spinner">
                    <mat-spinner class="c2a"></mat-spinner>
                </section>
                <uni-form
                    [config]="formConfig$"
                    [fields]="fields$"
                    [model]="model$">
                </uni-form>
                <br>
                <section>
                    <span>
                        Tilbakebetalingen vil bli registrert i DNB Regnskap. Husk å betale til kunden i nettbanken dersom dette ikke allerede er gjort.
                    </span>
                </section>
            </article>

            <footer class="center">
                <button (click)="close('cancel')" class="secondary">
                    Avbryt
                </button>
                <button (click)="close('ok')" class="c2a">
                    {{options?.buttonLabels?.accept||'Registrer tilbakebetaling'}}
                </button>
            </footer>
        </section>
    `
})
export class RegisterCustomerClaimPaymentModal implements IUniModal {
    @ViewChild(UniForm, { static: true })
    public form: UniForm;

    @Input()
    public options: IModalOptions;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public config: any = {};
    public model$: BehaviorSubject<any> = new BehaviorSubject(null);
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({});

    busy: boolean = true;

    private companySettingsID: number;
    private fromBankAccountsList: any;

    constructor(
        private bankAccountService: BankAccountService,
        private companySettingsService: CompanySettingsService,
        private toastService: ToastService,
        private paymentBatchService: PaymentBatchService,
        private paymentService: PaymentService,
    ) { }

    public ngOnInit() {
        if (this.options) {
            this.config = {
                title: 'Registrer tilbakebetaling',
                mode: null,
                model: this.options.data.model
            };

            const model = this.config.model;
            model.PaymentCodeID = model.PaymentCodeID || 1;
            this.bankAccountService.GetAll(`filter=CompanySettingsID ge 1`)
                .subscribe(data => {
                    this.fromBankAccountsList = data;
                    this.fields$.next(this.getFields());
                    this.model$.next(model);
                    this.busy = false;
                });
        }
    }

    public close(action: string) {
        this.busy = true;
        if (action === 'ok') {
            const data = this.model$.getValue();
            // validate
            if (!data['PaymentDate']) {
                this.toastService.addToast('Error', ToastType.bad, 5, 'Mangler fra Betaligsdato!');
                return false;
            } else if (!data['BusinessRelationID']) {
                this.toastService.addToast('Error', ToastType.bad, 5, 'Betales til er ugyldig!');
                return false;
            } else if (!data['FromBankAccountID']) {
                this.toastService.addToast('Error', ToastType.bad, 5, 'Mangler konto fra!');
                return false;
            } else if (!data['AmountCurrency']) {
                this.toastService.addToast('Error', ToastType.bad, 5, 'Mangler beløp');
                return false;
            }
            data.Amount = data.AmountCurrency * (data.CurrencyExchangeRate ? data.CurrencyExchangeRate : 1);

            this.savePayment(data).subscribe((savedPayment: Payment) => {
                this.paymentBatchService.updatePaymentsToPaidAndJournalPayments([savedPayment.ID]).subscribe((payments) => {
                    this.onClose.emit(payments[0]);
                });
            });
        } else {
            this.onClose.emit(false);
        }
    }

    private savePayment(payment): Observable<Payment> {
        return this.paymentService.ActionWithBody(
            null, payment, 'create-payment-with-tracelink',
            RequestMethod.Post, 'journalEntryID=' + this.options?.data?.journalEntryLine?.JournalEntryID)
            .map((x: Payment) => x);
    }

    private getFields() {
        return [
            {
                EntityType: 'Payment',
                Property: 'PaymentDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Betalingsdato',
                FieldSet: 0,
                Section: 0
            },
            {
                EntityType: 'Payment',
                Property: 'FromBankAccountID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Konto fra',
                FieldSet: 0,
                Section: 0,
                Options: {
                    source: this.fromBankAccountsList,
                    valueProperty: 'ID',
                    displayProperty: 'AccountNumber',
                    debounceTime: 200
                }
            },
            {
                EntityType: 'Payment',
                Property: 'AmountCurrency',
                FieldType: FieldType.NUMERIC,
                Label: 'Beløp',
                FieldSet: 0,
                Section: 0,
                Options: {
                    decimalLength: 2,
                    decimalSeparator: ','
                },
            }
        ];
    }
}

