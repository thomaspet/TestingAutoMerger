import {Component, ViewChild, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {IModalOptions, IUniModal} from './../../../../../framework/uni-modal';
import {ReminderSettings} from './reminderSettings';
import { CompanySettingsService } from '@app/services/services';
import { CustomerInvoiceReminderSettings, CompanySettings } from '@uni-entities';

@Component({
    selector: 'uni-reminder-settings-modal',
    template: `
        <section class="uni-modal medium"
            (clickOutside)="close(false)"
            (keydown.esc)="close(false)">

            <header>
                <h1>Instillinger for purring</h1>
            </header>

            <article>
                <reminder-settings [reminderSettings]="reminderSettings"></reminder-settings>
            </article>

            <footer>
                <button class="good" (click)="close(true)">Lagre</button>
                <button class="bad" (click)="close(false)">Avbryt</button>
            </footer>
        </section>
    `
})
export class UniReminderSettingsModal implements IUniModal, OnInit {
    @ViewChild(ReminderSettings) private settingsComponent: ReminderSettings;
    @Input() options: IModalOptions = {};
    @Output() onClose: EventEmitter<boolean> = new EventEmitter();

    reminderSettings: CustomerInvoiceReminderSettings;

    constructor(private companySettingsService: CompanySettingsService) {}

    close(saveBeforeClosing?: boolean) {
        if (saveBeforeClosing && this.settingsComponent) {
            this.settingsComponent.save()
                .then(() => this.onClose.emit(true))
                .catch(() => this.onClose.emit(false));
        } else {
            this.onClose.emit(false);
        }
    }

    ngOnInit() {
        this.companySettingsService.Get(
            1, [
                'CustomerInvoiceReminderSettings',
                'CustomerInvoiceReminderSettings.CustomerInvoiceReminderRules',
                'CustomerInvoiceReminderSettings.DebtCollectionSettings',
                'CustomerInvoiceReminderSettings.DebtCollectionSettings.DebtCollectionAutomation'
            ]
        ).subscribe((companySettings: CompanySettings) => this.reminderSettings = companySettings.CustomerInvoiceReminderSettings);
    }

}
