import {Component, Input, Output, EventEmitter} from '@angular/core';
import {BankAccount} from '@app/unientities';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';

@Component({
    selector: 'company-bankaccount-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign" style="width: 35rem">
            <header>{{options.header}}</header>
            <article>
                <section *ngIf="busy" class="modal-spinner">
                    <mat-spinner class="c2a"></mat-spinner>
                </section>

                <company-bankaccount-edit [bankAccount]="bankAccount" [isNew]="true" (setBusy)="setBusy($event)" (saved)="close($event)"> </company-bankaccount-edit>
            </article>
        </section>
    `,
    styleUrls: ['./bank-accounts.sass']
})
export class CompanyBankAccountModal implements IUniModal {

    @Input()
    options: IModalOptions = {};

    @Output()
    onClose = new EventEmitter();

    bankAccount: BankAccount;
    busy: boolean = true;

    constructor () { }

    public ngOnInit() {
        this.bankAccount = this.options.data.bankAccount;
    }

    setBusy(busy) {
        this.busy = busy;
    }

    close(value) {
        this.onClose.emit(value);
    }

}
