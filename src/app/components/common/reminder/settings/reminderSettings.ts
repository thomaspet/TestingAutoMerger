import {Component, Input, Output, EventEmitter} from '@angular/core';
import {CustomerInvoiceReminderSettings, DebtCollectionSettings} from '@uni-entities';
import {FieldType} from '@uni-framework/ui/uniform';
import {
    CustomerInvoiceReminderSettingsService,
    JobService,
    UniSearchAccountConfig
} from '@app/services/services';
import {BehaviorSubject, Observable} from 'rxjs';
import {DebtCollectionAutomations, DebtCollectionFormat} from '@app/models/sales/reminders/debtCollectionAutomations';

@Component({
    selector: 'reminder-settings',
    templateUrl: './reminderSettings.html'
})
export class ReminderSettings {
    @Input()
     private reminderSettings: CustomerInvoiceReminderSettings;

    @Input()
    public showLabelAbove: boolean = false;

    @Output()
    reminderSettingsChange: EventEmitter<CustomerInvoiceReminderSettings> = new EventEmitter<CustomerInvoiceReminderSettings>();

    isDirty: boolean = false;
    reminderSettings$: BehaviorSubject<CustomerInvoiceReminderSettings> = new BehaviorSubject(null);
    config$: BehaviorSubject<any> = new BehaviorSubject({ showLabelAbove: this.showLabelAbove});
    fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    reminderFields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    constructor(
        private customerInvoiceReminderSettingsService: CustomerInvoiceReminderSettingsService,
        private uniSearchAccountConfig: UniSearchAccountConfig,
        private jobService: JobService
    ) { }

    public ngOnChanges(change) {
        if (this.reminderSettings) {
            if (!this.reminderSettings.DebtCollectionSettings) {
                this.reminderSettings.DebtCollectionSettings = <DebtCollectionSettings>{
                    _createguid: this.customerInvoiceReminderSettingsService.getNewGuid()
                };
            }
            this.reminderSettings$.next(this.reminderSettings);
            this.setupForm();
        }

        if (change['showLabelAbove']) {
            this.config$.next({ showLabelAbove: this.showLabelAbove});
        }
    }

    public save(): Promise<any> {
        this.toggleDebtCollectionAutomationCronJob();
        return new Promise((resolve, reject) => {
            if (this.reminderSettings.RemindersBeforeDebtCollection >= this.reminderSettings.CustomerInvoiceReminderRules.length) {
                reject('Du har satt en verdi i feltet "Antall purringer før inkasso" som er større enn antall regler under "Purreregler" i bunn.');
            }

            this.customerInvoiceReminderSettingsService.Put(this.reminderSettings.ID, this.reminderSettings).subscribe(() => {
                this.isDirty = false;
                resolve();
            }, (err) => {
                reject(err);
            });
        });
    }

    public saveAndReturnObs (): Observable<any> {
        return this.customerInvoiceReminderSettingsService.Put(this.reminderSettings.ID, this.reminderSettings);
    }

    public onChange(data) {
        this.isDirty = true;
        this.reminderSettings = this.reminderSettings$.getValue();
        this.reminderSettingsChange.emit(this.reminderSettings);
    }

    private async setupForm() {

        this.reminderFields$.next([
            {
                Property: 'AcceptPaymentWithoutReminderFee',
                Label: 'Aksepter fakturabetaling uten purregebyr',
                FieldType: FieldType.CHECKBOX
            },
            {
                Legend: 'Purreinnstillinger',
                Property: 'MinimumAmountToRemind',
                Label: 'Minste fakturabeløp å purre',
                FieldType: FieldType.TEXT
            },
            {
                Property: 'DefaultReminderFeeAccountID',
                Label: 'Standardkonto purregebyr',
                FieldType: FieldType.UNI_SEARCH,
                Options: {
                    uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                    valueProperty: 'ID'
                }
            },
            {
                Property: 'RemindersBeforeDebtCollection',
                Label: 'Antall purringer før inkasso',
                FieldType: FieldType.NUMERIC,
                ReadOnly: !this.reminderSettings
                    || !this.reminderSettings.CustomerInvoiceReminderRules
                    || this.reminderSettings.CustomerInvoiceReminderRules.length < 2,
            },
            {
                Property: 'UseReminderRuleTextsInEmails',
                Label: 'Bruk tittel/beskrivelse fra purreregler som emne/tekst i e-post til kunde',
                FieldType: FieldType.CHECKBOX,
                Tooltip: {
                    Text: 'Du kan angi dine egne tekster til bruk i e-post til kunden hvis du krysser av her. ' +
                        'Tekstene hentes i så fall fra purrereglene. Alternativt brukes standardtekster'
                }
            }
        ]);

        const fields = [
            {
                Property: 'DebtCollectionSettings.IntegrateWithDebtCollection',
                Label: 'Integrasjon med inkasso',
                FieldType: FieldType.CHECKBOX,
            },
            {
                Property: 'DebtCollectionSettings.DebtCollectionFormat',
                Label: 'Inkassoformat',
                FieldType: FieldType.DROPDOWN,

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
