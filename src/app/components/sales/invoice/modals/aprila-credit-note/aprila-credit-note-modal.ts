import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';
import { CustomerInvoiceService, ErrorService } from '@app/services/services';


@Component({
    selector: 'aprila-credit-note-modal',
    templateUrl: './aprila-credit-note-modal.html',
    styleUrls: ['./aprila-credit-note-modal.sass']
})
export class AprilaCreditNoteModal implements OnInit, IUniModal {
    @Input()  options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    orderStatusType = {
        RECOURSED: 'RECOURSED',
        CREDITED: 'CREDITED',
        ERROR: 'ERROR'
    };

    orderStatus = '';
    constructor() { }

    public ngOnInit() {
        this.orderStatus = this.options.data.orderStatus;
    }

    public close(accpeted) {
        this.onClose.emit(accpeted);
    }
}
