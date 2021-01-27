import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal/interfaces';

@Component({
    selector: 'uni-file-upload-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign">
            <header>Velg filer som skal lastes opp</header>

            <article>
                <mat-progress-bar
                    *ngIf="loading$ | async"
                    class="uni-progress-bar"
                    mode="indeterminate">
                </mat-progress-bar>

                <uni-attachments 
                    class="account-attachments"
                    [entity]="'ReconcileAccount'"
                    [entityID]="account?.ID"
                    [multirowSelect]="false"
                    [showInfoBox]="false">
                </uni-attachments>

            </article>

            <footer class="center">
                <button (click)="close(true)" class="secondary"> Avbryt </button>
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
