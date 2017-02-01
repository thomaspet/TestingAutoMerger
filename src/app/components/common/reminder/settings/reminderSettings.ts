import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';
import {CustomerInvoiceReminderSettings, CustomerInvoiceReminderRule, FieldType} from '../../../../unientities';
import {Observable} from 'rxjs/Observable';
import {UniForm, UniFieldLayout} from 'uniform-ng2/main';
import {URLSearchParams} from '@angular/http';
import {
    CompanySettingsService,
    CustomerInvoiceReminderSettingsService,
    ErrorService
} from '../../../../services/services';

declare const moment;

@Component({
    selector: 'reminder-settings',
    templateUrl: 'app/components/common/reminder/settings/reminderSettings.html'
})
export class ReminderSettings {
    @Input() private settings: CustomerInvoiceReminderSettings;

    private config: any = {};
    private fields: any[] = [];

    constructor(private router: Router,
                private companySettingsService: CompanySettingsService,
                private customerInvoiceReminderSettingsService: CustomerInvoiceReminderSettingsService,
                private errorService: ErrorService) {
    }

    public ngOnInit() {
        this.setupForm();
    }

    public save(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.customerInvoiceReminderSettingsService.Put(this.settings.ID, this.settings).subscribe(() => {
                resolve();
            }, (err) => {
                this.errorService.handle(err);
                reject();
            });
        });
    }

    private setupForm() {
        if (!this.settings) {
            this.companySettingsService.Get(1, ['CustomerInvoiceReminderSettings','CustomerInvoiceReminderSettings.CustomerInvoiceReminderRules'])
                .subscribe((settings) => {
                    this.settings = settings.CustomerInvoiceReminderSettings;
                });
        }

        let minimumAmountToRemind = new UniFieldLayout();
        minimumAmountToRemind.EntityType = 'CustomerInvoiceReminderSettings';
        minimumAmountToRemind.Property = 'MinimumAmountToRemind';
        minimumAmountToRemind.FieldType = FieldType.NUMERIC;
        minimumAmountToRemind.Label = 'Minstebeløp';

        let remindersBeforeDebtCollection = new UniFieldLayout();
        remindersBeforeDebtCollection.EntityType = 'CustomerInvoiceReminderSettings';
        remindersBeforeDebtCollection.Property = 'RemindersBeforeDebtCollection';
        remindersBeforeDebtCollection.FieldType = FieldType.NUMERIC;
        remindersBeforeDebtCollection.Label = 'Antall purringer før inkasso';

        this.fields = [minimumAmountToRemind, remindersBeforeDebtCollection];
    }
}
