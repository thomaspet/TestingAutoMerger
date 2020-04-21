import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IUniModal, IModalOptions, ConfirmActions } from '@uni-framework/uni-modal';
import { RegulativeService } from '@app/services/services';
export enum NewRegulativeActions {
    CANCEL,
    IMPORT,
    TEMPLATE_DOWNLOADED,
}
@Component({
  selector: 'uni-new-regulative-modal',
  templateUrl: './new-regulative-modal.component.html',
  styleUrls: ['./new-regulative-modal.component.sass']
})
export class NewRegulativeModalComponent implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();
    forceCloseValueResolver: () => NewRegulativeActions.CANCEL;

    constructor() {}

    import() {
        this.onClose.emit(NewRegulativeActions.IMPORT);
    }

    template() {
        this.onClose.emit(NewRegulativeActions.TEMPLATE_DOWNLOADED);
    }

}
