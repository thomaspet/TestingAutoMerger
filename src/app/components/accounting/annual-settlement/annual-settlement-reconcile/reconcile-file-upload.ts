import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal/interfaces';

@Component({
    selector: 'recaccount-file-upload-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign">
            <header>Velg filer som skal lastes opp</header>

            <article>
                <span class="info-text"> Filer som knyttes til konto: <strong> {{ account._AccountNumber }} - {{ account._AccountName }} </strong> </span>
                <uni-attachments 
                    class="account-attachments"
                    [entity]="'ReconcileAccount'"
                    [entityID]="account?.ID"
                    [multirowSelect]="false"
                    [showInfoBox]="false">
                </uni-attachments>

            </article>

            <footer class="center">
                <button (click)="close(true)" class="secondary"> Lukk </button>
            </footer>
        </section>
    `
})
export class UniReconcileAccountFileUploadModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    account: any = {};

    constructor() {}

    ngOnInit() {
        this.account = this.options.data.account;
    }

    public close(cancel: boolean = false) {
        this.onClose.emit(null);
    }
}
