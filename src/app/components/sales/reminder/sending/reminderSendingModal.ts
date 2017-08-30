import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from './../../../../../framework/uniModal/barrel';
import {ReminderSending} from './reminderSending';

@Component({
    selector: 'uni-reminder-settings-modal',
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
                <button class="good" (click)="send()">Send valgte</button>
                <button class="warning" (click)="print()">Skriv ut valgte</button>
                <button class="good" (click)="save()">Lagre endringer</button>
                <button class="bad" (click)="close()">Avbryt</button>
            </footer>
        </section>
    `
})
export class UniReminderSendingModal implements IUniModal {
    @ViewChild(ReminderSending)
    private sendingComponent: ReminderSending;

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<boolean> = new EventEmitter();

    public ngAfterViewInit() {
        if (this.options && this.options.data && this.sendingComponent) {
            this.sendingComponent.updateReminderList(this.options.data);
        }
    }

    public send() {
        this.sendingComponent.sendEmail();
        this.sendingComponent.sendPrint(false);
    }

    public print() {
        this.sendingComponent.sendPrint(true);
    }

    public save() {
        console.log('save clicked!');
        setTimeout(() => this.sendingComponent.saveReminders());
    }

    public close(saveBeforeClosing?: boolean) {
        this.onClose.emit();
    }

}
