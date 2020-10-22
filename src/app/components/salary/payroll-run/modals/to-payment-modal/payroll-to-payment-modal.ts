import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';
import { PayrollRun } from '@uni-entities';
import { ErrorService, PaymentBatchService, ActionOnPaymentReload, UniTranslationService, SharedPayrollRunService } from '@app/services/services';
import { of, BehaviorSubject } from 'rxjs';
import { PayrollRunService } from '@app/components/salary/shared/services/payroll-run/payroll-run.service';

@Component({
    selector: 'payroll-to-payment-modal',
    templateUrl: './payroll-to-payment-modal.html',
    styleUrls: ['./payroll-to-payment-modal.sass']
})
export class PayrollToPaymentModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    payrollRun: PayrollRun;
    empCount: number;
    payDate: Date = null;
    paymentSum: number = 0;
    current$ = new BehaviorSubject(null);
    fields$ = [];
    isPaymentOnly: boolean;
    payrollText: string = '';
    paymentYear: number;

    busy = true;
    onlyToPayment = false;
    hasErrors = false;
    errorMessage = '';
    errorOncloseValue = 0;
    accounts: any[] = [];
    total = {
        net: 0,
        vat: 0,
        sum: 0
    };

    VALUE_ITEMS: IValueItem[];

    constructor(
        private errorSerivce: ErrorService,
        private paymentBatchService: PaymentBatchService,
        private translationService: UniTranslationService,
        private sharedPayrollRunService: SharedPayrollRunService,
        private payrollRunService: PayrollRunService
    ) { }

    ngOnInit() {
        this.payrollRun = this.options?.data?.payrollRunData;
        this.empCount = this.options?.data?.empCount;
        this.payDate = this.payrollRun?.PayDate;
        this.paymentSum = this.options?.data?.paymentSum;
        this.paymentYear = this.options?.data?.paymentYear;
        this.payrollText = this.translationService.translate('ENTITIES.PayrollRun');

        this.VALUE_ITEMS = this.getValueItems();

        this.paymentBatchService.checkAutoBankAgreement().subscribe(agreements => {

            if (!agreements?.length || agreements.filter(a => a.StatusCode === 700005).length === 0) {
                this.VALUE_ITEMS[0].disabled = true;
                this.valueItemSelected(this.VALUE_ITEMS[1]);
            }

            this.busy = false;
        }, () => {
            this.VALUE_ITEMS[0].disabled = true;
            this.valueItemSelected(this.VALUE_ITEMS[1]);
            this.busy = false;
        });
    }

    valueItemSelected(item: any) {
        if (item.selected || item.disabled || !!this.errorMessage) {
            return;
        } else {
            this.VALUE_ITEMS.forEach(i => i.selected = false);
            item.selected = true;
        }
    }

    send() {
        const value = this.VALUE_ITEMS.find(i => i.selected).value;
        const obs = of(true);
        this.busy = true;

        obs.subscribe(() => {
            if (value === 1) {
                this.createPaymentSendToBank();
            } else {
                this.onClose.emit(ActionOnPaymentReload.SendToPaymentList);
            }
        }, err => {
            this.busy = false;
            this.errorMessage = 'Noe gikk galt';
            this.errorSerivce.handle(err);
            this.errorOncloseValue = ActionOnPaymentReload.DoNothing;
        });
    }
    createPaymentSendToBank() {
        this.payrollRunService.sendPaymentList(this.payrollRun.ID)
            .subscribe(response => {
                if (response) {
                    this.sharedPayrollRunService.getPaymentIDsQueuedOnPayrollRun(this.payrollRun).subscribe(payments => {
                        const paymentIDs = payments.map(x => x.PaymentID);
                        this.paymentBatchService.sendAutobankPayment({ Code: null, Password: null, PaymentIds: paymentIDs })
                            .subscribe(() => { this.onClose.emit(ActionOnPaymentReload.SentToBank);
                        }, err => {
                            this.busy = false;
                            this.errorMessage = 'Betaling ble opprettet, men kunne ikke sende den til banken. Gå til Bank - Utbetalinger og send den på nytt.';
                            this.errorSerivce.handle(err);
                        });
                    });
                }
            }, err => {
                this.busy = false;
                this.errorMessage = 'Noe gikk galt ved oppretting av betaling';
                this.errorSerivce.handle(err);
            });
    }

    close() {
        this.onClose.emit(this.errorOncloseValue);
    }


    private getValueItems() {
        return [
            {
                selected: true,
                label: `Send ${this.payrollText.toLowerCase()} til banken nå`,
                infoText: `${this.payrollText} vil bli sendt til banken. Du må logge deg på nettbanken din for å godkjenne utbetalingen`,
                value: 1,
                disabled: false
            },
            {
                selected: false,
                label: 'Legg til betalingsliste',
                infoText: `${this.payrollText}  vil bli lagt til betalingslisten
                    hvor du kan betale den senere eller betale flere samtidig.`,
                value: 2,
                disabled: false
            }
        ];
    }

}

interface IValueItem {
    selected: boolean;
    label: string;
    infoText: string;
    value: number;
    disabled: boolean;
}
