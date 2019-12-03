import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import {WidgetDataService} from '../../widgetDataService';
import * as moment from 'moment';

export enum LiquidityPaymentInterval {
    OneTime = 0,
    Monthly = 30,
    Yearly = 365
}

@Component({
    selector: 'custom-payments-modal',
    templateUrl: `./custom-payment-modal.html`,
    styleUrls: ['./liquidity-widget.sass']
})

export class CustomPaymentModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    interval: LiquidityPaymentInterval = LiquidityPaymentInterval.OneTime;
    errorMsg: string = '';
    editMode: boolean = false;
    dataLoaded: boolean = false;
    busy: boolean = true;
    payments: any = [];
    customPaymentObject: any = this.getNewPayment();

    constructor(
        private widgetDataService: WidgetDataService,
        private toastService: ToastService
    ) { }

    public ngOnInit() {
        this.editMode = this.options.data.isNew;

        if (this.editMode) {
            this.busy = false;
        } else {
            this.getDataAndLoadList();
        }
    }

    getDataAndLoadList() {
        this.busy = true;
        if (this.dataLoaded) {
            this.busy = this.editMode = false;
        } else {
            this.widgetDataService.getCustomLiquidityPayments().subscribe(response => {
                this.payments = response;
                this.busy = false;
                this.editMode = false;
                this.dataLoaded = true;
            }, err => this.busy = false);
        }
    }

    saveCustomPayment() {
        if (!this.customPaymentObject.Description) {
            this.errorMsg = 'Betaling må ha beskrivelse';
            return;
        }

        if (!this.customPaymentObject.Amount || this.customPaymentObject.Amount < 0) {
            this.errorMsg = 'Sum kan ikke være tom eller mindre enn 0';
            return;
        }

        if (moment().isSameOrAfter(this.customPaymentObject.DueDate)) {
            this.errorMsg = 'Dato må være fram i tid';
            return;
        }

        this.busy = true;
        this.customPaymentObject.CustomLiquidityPaymentType = this.interval;
        this.customPaymentObject.DueDate = moment(this.customPaymentObject.DueDate).format('YYYY-MM-DD');

        this.widgetDataService.addCustomLiquidityPayment(this.customPaymentObject).subscribe((response) => {
            this.busy = false;
            this.toastService.addToast('Betaling registrert', ToastType.good, 5);
            this.close(true);
        }, err => this.busy = false);
    }

    setCurrent(payment) {
        this.customPaymentObject = payment;
        this.interval = payment.CustomLiquidityPaymentType;
        this.editMode = true;
    }

    getNewPayment() {
        return {
            Amount: 0,
            IsCustomerPayment: true,
            Description: '',
            DueDate: new Date(),
            CustomLiquidityPaymentType: LiquidityPaymentInterval.OneTime,
            ID: 0
        };
    }

    deletePayment(payment, index: number) {
        this.widgetDataService.deleteCustomLiquidityPayment(payment.ID).subscribe(() => {
            this.toastService.addToast('Betaling slettet', ToastType.good, 5);
            this.payments.splice(index, 1);
        }, err => {
            this.toastService.addToast('Kunne ikke slette betaling', ToastType.bad, 5);
        });
    }

    close(emitValue?: boolean) {
        this.onClose.emit(emitValue);
    }
}
