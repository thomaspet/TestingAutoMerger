import {Component, EventEmitter} from '@angular/core';
import {ConfirmActions, IModalOptions} from '@uni-framework/uni-modal/interfaces';

@Component({
    selector: 'register-asset-modal',
    templateUrl: './register-asset-modal.html'
})
export class RegisterAssetModal {
    options: IModalOptions;
    onClose = new EventEmitter();

    constructor() {
    }

    accept() {
        this.onClose.emit(ConfirmActions.ACCEPT);
    }
    cancel() {
        this.onClose.emit(ConfirmActions.CANCEL);
    }
    reject() {
        this.onClose.emit(ConfirmActions.REJECT);
    }
}
