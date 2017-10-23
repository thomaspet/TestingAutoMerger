import {Component, OnInit, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {PaycheckSending} from './paycheckSending';
import {IUniModal, IModalOptions} from '../../../../../framework/uniModal/barrel';

@Component({
    selector: 'paycheck-sender-modal',
    templateUrl: './paycheckSenderModal.html'
})

export class PaycheckSenderModal implements OnInit, IUniModal {
    @ViewChild(PaycheckSending) private paycheckSending: PaycheckSending;
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<any> = new EventEmitter<any>();
    public checkedEmailEmps: number;
    public checkedPrintEmps: number;
    public busy: boolean;

    constructor() { }

    public ngOnInit() { }

    public emailPaychecks() {
        this.paycheckSending.emailPaychecks();
    }

    public printPaychecks(all: boolean) {
        this.paycheckSending.printPaychecks(all);
    }

    public close() {
        this.onClose.next(true);
    }

    public checkedEmails(event: number) {
        this.checkedEmailEmps = event;
    }

    public checkedPrints(event: number) {
        this.checkedPrintEmps = event;
    }

    public setBusy(event: boolean) {
        this.busy = event;
    }
}
