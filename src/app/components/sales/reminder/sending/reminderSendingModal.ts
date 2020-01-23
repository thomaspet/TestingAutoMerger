import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from './../../../../../framework/uni-modal';
import {ReminderSending} from './reminderSending';
import {EHFService} from '@app/services/services';

@Component({
    selector: 'uni-reminder-sending-modal',
    template: `
        <section class="uni-modal large">
            <header>Utsendelse av purringer</header>

            <article>
                <reminder-sending [modalMode]="true"></reminder-sending>
            </article>

            <footer>
                <button class="secondary pull-left" (click)="onClose.emit()">Lukk</button>

                <button class="secondary" (click)="reminderSending.sendPrint(true)">Skriv ut valgte</button>
                <button class="secondary" (click)="send()">Send valgte til epost/utskrift</button>
                <button *ngIf="ehfService.isInvoicePrintActivated()" class="secondary" (click)="reminderSending.sendInvoicePrint()">
                    Send valgte til fakturaprint
                </button>
            </footer>
        </section>
    `
})
export class UniReminderSendingModal implements IUniModal {
    @ViewChild(ReminderSending, { static: true }) reminderSending: ReminderSending;
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    constructor(public ehfService: EHFService) { }

    ngAfterViewInit() {
        if (this.options && this.options.data && this.reminderSending) {
            this.reminderSending.updateReminderList(this.options.data);
        }
    }

    send() {
        this.reminderSending.sendEmail();
        this.reminderSending.sendPrint(false);
    }
}
