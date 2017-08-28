import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { PaycheckSending } from './paycheckSending';
import { IUniModal, IModalOptions } from '../../../../../framework/uniModal/barrel';

@Component({
    selector: 'paycheck-sender-modal',
    templateUrl: './paycheckSenderModal.html'
})

export class PaycheckSenderModal implements OnInit, IUniModal {
    @ViewChild(PaycheckSending) private paycheckSending: PaycheckSending;
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<any> = new EventEmitter<any>();

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
}
