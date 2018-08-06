import {Component, Input} from '@angular/core';
import {CustomerInvoiceReminderSettings} from '@uni-entities';
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
    @Input() private settings: CustomerInvoiceReminderSettings;

    public isDirty: boolean = false;
    public settings$: BehaviorSubject<CustomerInvoiceReminderSettings> = new BehaviorSubject(null);
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    constructor(private companySettingsService: CompanySettingsService,
                private customerInvoiceReminderSettingsService: CustomerInvoiceReminderSettingsService,
                private errorService: ErrorService,
                private jobService: JobService,) {
    }

    public ngOnInit() {
        this.settings$.next(this.settings);
        this.setupForm();
    }

    public ngOnChanges() {
        this.settings$.next(this.settings);
    }

    public save(): Promise<any> {
        this.toggleDebtCollectionAutomationCronJob();
        return new Promise((resolve, reject) => {
            this.customerInvoiceReminderSettingsService.Put(this.settings.ID, this.settings).subscribe(() => {
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

    private setupForm() {
        if (!this.settings) {
            this.companySettingsService.Get(
                1, [
                    'CustomerInvoiceReminderSettings',
                    'CustomerInvoiceReminderSettings.CustomerInvoiceReminderRules',
                    'CustomerInvoiceReminderSettings.DebtCollectionSettings',
                    'CustomerInvoiceReminderSettings.DebtCollectionSettings.DebtCollectionAutomation'
                ]
            )
                .subscribe((settings) => {
                    this.settings = settings.CustomerInvoiceReminderSettings;
                    this.settings$.next(this.settings);
                });
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
        ];

        this.fields$.next(fields);
    }

    private toggleDebtCollectionAutomationCronJob() {
        // Remove old cron jobs
        this.jobService.getSchedules('DebtCollectionAutomationJob').subscribe(
            result => {
                for (var key in result) {
                    this.jobService.deleteSchedule(key).subscribe(
                        result =>
                        err => console.log(err)
                    );
                }
            },
            err => console.log(err)
        );

        var id = this.settings.DebtCollectionSettings.DebtCollectionAutomationID;

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
