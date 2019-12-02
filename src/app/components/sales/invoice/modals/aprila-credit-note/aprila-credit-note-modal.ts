import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';

@Component({
    selector: 'aprila-credit-note-modal',
    templateUrl: './aprila-credit-note-modal.html',
    styleUrls: ['./aprila-credit-note-modal.sass']
})
export class AprilaCreditNoteModal implements OnInit, IUniModal {
    @Input()  options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    header: string;
    orderStatusType = {
        RECOURSED: 'RECOURSED',
        CREDITED: 'CREDITED',
        ERROR: 'ERROR'
    };

    orderStatus = '';
    constructor() { }

    public ngOnInit() {
        this.orderStatus = this.options.data.orderStatus;
        this.header = this.orderStatus === this.orderStatusType.ERROR
            ? 'Feil: Fakturaen er ikke blitt kreditert'
            : `Faktura ${this.options.data.invoiceNumber} er kreditert`;
    }

    public close(accpeted) {
        this.onClose.emit(accpeted);
    }
}
