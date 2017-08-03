import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from './../../../../../framework/uniModal/barrel';
import {ReminderSettings} from './reminderSettings';

@Component({
    selector: 'uni-reminder-settings-modal',
    template: `
        <dialog class="uni-modal medium"
            (clickOutside)="close(false)"
            (keydown.esc)="close(false)">

            <header>
                <h1>Instillinger for purring</h1>
            </header>

            <main>
                <reminder-settings></reminder-settings>
            </main>

            <footer>
                <button class="good" (click)="close(true)">Lagre</button>
                <button class="bad" (click)="close(false)">Avbryt</button>
            </footer>
        </dialog>
    `
})
export class UniReminderSettingsModal implements IUniModal {
    @ViewChild(ReminderSettings)
    private settingsComponent: ReminderSettings;

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<boolean> = new EventEmitter();

    public close(saveBeforeClosing?: boolean) {
        if (saveBeforeClosing && this.settingsComponent) {
            this.settingsComponent.save()
                .then(() => this.onClose.emit(true))
                .catch(() => this.onClose.emit(false));
        } else {
            this.onClose.emit(false);
        }
    }

}
