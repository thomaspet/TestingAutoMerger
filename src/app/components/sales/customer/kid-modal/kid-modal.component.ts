import { IModalOptions, IUniModal } from '@uni-framework/uni-modal';
import { Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
    selector: 'uni-kid-modal',
    templateUrl: './kid-modal.component.html'
})
export class KidModalComponent implements IUniModal {
    @Input() options: IModalOptions;
    @Output() onClose: EventEmitter<any> = new EventEmitter<any>(true);

    constructor() {}

    accept() {
        this.onClose.emit(true);
    }

    close() {
        this.onClose.emit(false);
    }
}
