import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IUniModal, IModalOptions, ConfirmActions } from '@uni-framework/uni-modal/interfaces';

@Component({
    selector: 'uni-brunoaccountsconfigconfirm-modal',
    styleUrls: ['./bank-accounts-config-confirm-modal.sass'],
    template: `
        <section role="dialog" class="uni-modal uni-redesign" style="width: 38rem">
            <header></header>
            <section Id="success-content">
                <img Id="icon-success" [src]="options.icon">
                <section style="font-size: 25px; margin-bottom: 1rem;"> {{ options?.header }} </section>
                <section style="padding-top: 10px; margin-bottom: 2.5rem;" [innerHTML]="options.message"> </section>

                <footer [ngClass]="options?.footerCls">
                    <button *ngIf="options?.buttonLabels?.cancel" class="pull-left secondary" (click)="cancel()">
                        {{options.buttonLabels.cancel}}
                        <i class="material-icons" *ngIf="options?.buttonIcons?.cancel"> {{ options.buttonIcons.cancel }} </i>
                    </button>

                    <button *ngIf="options?.buttonLabels?.reject"
                        class="secondary"
                        (click)="reject()">
                        {{options.buttonLabels.reject}}
                        <i class="material-icons" *ngIf="options?.buttonIcons?.reject"> {{ options.buttonIcons.reject }} </i>
                    </button>

                    <button *ngIf="options?.buttonLabels?.accept"
                        class="c2a icon-confirm-modal-button"
                        style="width: auto;"
                        id="good_button_ok"
                        (click)="accept()">
                        {{ options.buttonLabels.accept }}
                        <i class="material-icons" *ngIf="options?.buttonIcons?.accept"> {{ options.buttonIcons.accept }} </i>
                    </button>
                </footer>

            </section>
        </section>
    `
})
export class ConfigBankAccountsConfirmModal implements IUniModal {
    @Input()
    options: IModalOptions = {};

    @Output()
    onClose = new EventEmitter();

    accept() {
        this.onClose.emit(ConfirmActions.ACCEPT);
    }

    reject() {
        this.onClose.emit(ConfirmActions.REJECT);
    }

    cancel() {
        this.onClose.emit(ConfirmActions.CANCEL);
    }
}
