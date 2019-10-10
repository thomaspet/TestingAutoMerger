import {Component, Input, Output, EventEmitter} from '@angular/core';
import {CustomerInvoiceReminderSettings, DebtCollectionSettings} from '@uni-entities';
import {FieldType} from '@uni-framework/ui/uniform';
import {
    CustomerInvoiceReminderSettingsService,
    JobService,
    UniSearchAccountConfig
} from '@app/services/services';
import {BehaviorSubject} from 'rxjs';
import {DebtCollectionAutomations, DebtCollectionFormat} from '@app/models/sales/reminders/debtCollectionAutomations';

@Component({
    selector: 'reminder-settings',
    templateUrl: './reminderSettings.html'
})
export class ReminderSettings {
    @Input() private reminderSettings: CustomerInvoiceReminderSettings;
    @Output() reminderSettingsChange: EventEmitter<CustomerInvoiceReminderSettings> = new EventEmitter<CustomerInvoiceReminderSettings>();

    public isDirty: boolean = false;
    public reminderSettings$: BehaviorSubject<CustomerInvoiceReminderSettings> = new BehaviorSubject(null);
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    constructor(private customerInvoiceReminderSettingsService: CustomerInvoiceReminderSettingsService,
        private uniSearchAccountConfig: UniSearchAccountConfig,
        private jobService: JobService) {
    }

    public ngOnChanges() {
        if (this.reminderSettings) {
            if (!this.reminderSettings.DebtCollectionSettings) {
                this.reminderSettings.DebtCollectionSettings = <DebtCollectionSettings>{
                    _createguid: this.customerInvoiceReminderSettingsService.getNewGuid()
                };
            }
            this.reminderSettings$.next(this.reminderSettings);
            this.setupForm();
        }
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
        this.reminderSettings = this.reminderSettings$.getValue();
        this.reminderSettingsChange.emit(this.reminderSettings);
    }

    private async setupForm() {
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
                FieldSet: 1,
                ReadOnly: !this.reminderSettings
                    || !this.reminderSettings.CustomerInvoiceReminderRules
                    || this.reminderSettings.CustomerInvoiceReminderRules.length < 2,
                Tooltip: {
                    Text: 'Det må være opprettet likt antall purreregler under + regel for inkasso for å få lagre dette feltet.'
                },
            },
            {
                Property: 'AcceptPaymentWithoutReminderFee',
                Label: 'Aksepter fakturabetaling uten purregebyr',
                FieldType: FieldType.CHECKBOX,
                Section: 0,
                FieldSet: 1
            },
            {
                Property: 'DefaultReminderFeeAccountID',
                Label: 'Standardkonto purregebyr',
                FieldType: FieldType.UNI_SEARCH,
                Section: 0,
                FieldSet: 1,
                Options: {
                    uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                    valueProperty: 'ID'
                }
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
                Property: 'DebtCollectionSettings.DebtCollectionFormat',
                Label: 'Inkassoformat',
                FieldType: FieldType.DROPDOWN,
                Section: 0,
                FieldSet: 2,

                Options: {
                    source: [
                        { ID: DebtCollectionFormat.Predator, Label: 'Predator' },
                        { ID: DebtCollectionFormat.Lindorff, Label: 'Lindorff' }
                    ],
                    valueProperty: 'ID',
                    displayProperty: 'Label'
                }
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
