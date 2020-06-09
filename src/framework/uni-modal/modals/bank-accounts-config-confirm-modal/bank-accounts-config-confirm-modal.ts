import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IUniModal, IModalOptions } from '@uni-framework/uni-modal/interfaces';
import { UniModalService } from '@uni-framework/uni-modal/modalService';

@Component({
    selector: 'uni-brunoaccountsconfigconfirm-modal',
    styleUrls: ['./bank-accounts-config-confirm-modal.sass'],
    template: `
        <section role="dialog" class="uni-modal uni-redesign">
            <header></header>
            <section Id="success-content">
                <img Id="icon-success" [src]="icon">
                <section style="font-size: 25px;">Integrasjonen med banken er klar!</section>
                <section style="padding-top: 10px;">Alle bankkontoer er nå oppdatert i DNB Regnskap og er klar for bruk</section>
                <br/>
                <button class="c2a" (click)="close()">Ok</button>
            </section>
        </section>
    `
})
export class ConfigBankAccountsConfirmModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Input() modalService: UniModalService;
    @Output() onClose = new EventEmitter();

    icon: string = 'themes/ext02/ext02-success-accountconfig.svg';

    close() {
        this.onClose.emit(null);
    }
}