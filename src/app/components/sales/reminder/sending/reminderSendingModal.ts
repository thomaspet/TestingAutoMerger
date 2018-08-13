import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from './../../../../../framework/uni-modal';
import {ReminderSending} from './reminderSending';
import {EHFService} from '@app/services/services';

@Component({
    selector: 'uni-reminder-sending-modal',
    template: `
        <section class="uni-modal medium"
            (clickOutside)="close()"
            (keydown.esc)="close()">

            <header>
                <h1>Utsendelse av purringer</h1>
            </header>

            <article>
                <reminder-sending [modalMode]="true"></reminder-sending>
            </article>

            <footer>
                <button class="good" (click)="send()">Send valgte til epost/utskrift</button>
                <button *ngIf="ehfService.isActivated('NETSPRINT')" class="good" (click)="reminderSending.sendInvoicePrint()">
                    Send valgte til fakturaprint
                </button>
                <button class="warning" (click)="reminderSending.sendPrint(true)">Skriv ut valgte</button>
                <button class="good" (click)="save()">Lagre endringer</button>
                <button class="bad" (click)="close()">Lukk</button>
            </footer>
        </section>
    `
})
export class UniReminderSendingModal implements IUniModal {
    @ViewChild(ReminderSending)
    reminderSending: ReminderSending;

    @Input()
    options: IModalOptions = {};

    @Output()
    onClose: EventEmitter<boolean> = new EventEmitter();

    constructor( public ehfService: EHFService) { }

    ngAfterViewInit() {
        if (this.options && this.options.data && this.reminderSending) {
            this.reminderSending.updateReminderList(this.options.data);
        }
    }

    send() {
        this.reminderSending.sendEmail();
        this.reminderSending.sendPrint(false);
    }

    save() {
        setTimeout(() => this.reminderSending.saveReminders());
    }

    close(saveBeforeClosing?: boolean) {
        this.onClose.emit();
    }
}
