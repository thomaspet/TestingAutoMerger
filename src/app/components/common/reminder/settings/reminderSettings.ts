import {Component, Input} from '@angular/core';
import {CustomerInvoiceReminderSettings, CompanySettings} from '@uni-entities';
import {FieldType} from '@uni-framework/ui/uniform';
import {
    CompanySettingsService,
    CustomerInvoiceReminderSettingsService,
    ErrorService,
    JobService
} from '@app/services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {DebtCollectionAutomations} from '@app/models/sales/reminders/debtCollectionAutomations';

@Component({
    selector: 'reminder-settings',
    templateUrl: './reminderSettings.html'
})
export class ReminderSettings {
    @Input() private reminderSettings: CustomerInvoiceReminderSettings;

    public isDirty: boolean = false;
    public reminderSettings$: BehaviorSubject<CustomerInvoiceReminderSettings> = new BehaviorSubject(null);
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    constructor(private companySettingsService: CompanySettingsService,
                private customerInvoiceReminderSettingsService: CustomerInvoiceReminderSettingsService,
                private errorService: ErrorService,
                private jobService: JobService) {
    }

    public ngOnInit() {
        this.setupForm();
    }

    public ngOnChanges() {
        this.reminderSettings$.next(this.reminderSettings);
    }

    public save(): Promise<any> {
        this.toggleDebtCollectionAutomationCronJob();
        return new Promise((resolve, reject) => {
            this.customerInvoiceReminderSettingsService.Put(this.reminderSettings.ID, this.reminderSettings).subscribe(() => {
                this.isDirty = false;
                resolve();
            }, (err) => {
                reject(err);
            });
        });
    }

    public onChange(data) {
        this.isDirty = true;
    }

    private async setupForm() {
        if (!this.reminderSettings) {
            const companySettings: CompanySettings = await this.companySettingsService.Get(
                1, [
                    'CustomerInvoiceReminderSettings',
                    'CustomerInvoiceReminderSettings.CustomerInvoiceReminderRules',
                    'CustomerInvoiceReminderSettings.DebtCollectionSettings',
                    'CustomerInvoiceReminderSettings.DebtCollectionSettings.DebtCollectionAutomation'
                ]
            ).toPromise();
            this.reminderSettings = companySettings.CustomerInvoiceReminderSettings;
            this.reminderSettings$.next(this.reminderSettings);
        }

        const fields = [
            {
                Legend: 'Purreinnstillinger',
                Property: 'MinimumAmountToRemind',
                Label: 'Minste fakturabeløp å purre',
                FieldType: FieldType.TEXT,
                Section: 0,
                FieldSet: 1,
            },
            {
                Property: 'RemindersBeforeDebtCollection',
                Label: 'Antall purringer før inkasso',
                FieldType: FieldType.TEXT,
                Section: 0,
                FieldSet: 1
            },
            {
                Property: 'AcceptPaymentWithoutReminderFee',
                Label: 'Aksepter fakturabetaling uten purregebyr',
                FieldType: FieldType.CHECKBOX,
                Section: 0,
                FieldSet: 1
            },
            {
                Legend: 'Inkassoinnstillinger',
                Property: 'DebtCollectionSettings.IntegrateWithDebtCollection',
                Label: 'Integrasjon med inkasso',
                FieldType: FieldType.CHECKBOX,
                Section: 0,
                FieldSet: 2,
            },
            {
                Property: 'DebtCollectionSettings.DebtCollectionAutomationID',
                Label: 'Automatisering',
                FieldType: FieldType.DROPDOWN,
                Section: 0,
                FieldSet: 2,
                Options: {
                    source: this.reminderSettings.DebtCollectionSettings.DebtCollectionAutomation,
                    valueProperty: 'ID',
                    hideDeleteButton: true,
                    searchable: false,
                    template: (item) => {
                        // TODO: Add a line break between name and description,
                        //       or make things more readable in another way
                        return item.Name + ': ' + item.Description;
                    }
                }
            },
            {
                Property: 'DebtCollectionSettings.CreditorNumber',
                Label: 'Vårt kundenr hos inkassobyrå',
                FieldType: FieldType.TEXT,
                Section: 0,
                FieldSet: 2,
            }
        ];

        this.fields$.next(fields);
    }

    private toggleDebtCollectionAutomationCronJob() {
        // Remove old cron jobs
        this.jobService.getSchedules('DebtCollectionAutomationJob').subscribe(
            result => {
                Object.keys(result).forEach(key => {
                    this.jobService.deleteSchedule(key).subscribe(
                        () => {},
                        err => console.log(err)
                    );
                });
            },
            err => console.log(err)
        );

        const id = this.reminderSettings.DebtCollectionSettings.DebtCollectionAutomationID;

        if ((id === DebtCollectionAutomations.SemiAuto) || (id === DebtCollectionAutomations.FullAuto)) {
            // Make new cron job
            // '0 0 * * *' = Run once a day at midnight
            this.jobService.createSchedule('DebtCollectionAutomationJob', '0 0 * * *').subscribe(
                result =>
                err => console.log(err)
            );
        }
    }
}
