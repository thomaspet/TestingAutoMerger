import {Component, Input} from '@angular/core';
import {CustomerInvoiceReminderSettings} from '../../../../unientities';
import {FieldType} from 'uniform-ng2/main';
import {UniFieldLayout} from 'uniform-ng2/main';
import {
    CompanySettingsService,
    CustomerInvoiceReminderSettingsService,
    ErrorService
} from '../../../../services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

declare const moment;

@Component({
    selector: 'reminder-settings',
    templateUrl: './reminderSettings.html'
})
export class ReminderSettings {
    @Input() private settings: CustomerInvoiceReminderSettings;

    public isDirty: boolean = false;
    private settings$: BehaviorSubject<CustomerInvoiceReminderSettings> = new BehaviorSubject(null);
    private config$: BehaviorSubject<any> = new BehaviorSubject({});
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    constructor(private companySettingsService: CompanySettingsService,
                private customerInvoiceReminderSettingsService: CustomerInvoiceReminderSettingsService,
                private errorService: ErrorService) {
    }

    public ngOnInit() {
        this.settings$.next(this.settings);
        this.setupForm();
    }

    public ngOnChanges() {
        this.settings$.next(this.settings);
    }

    public save(): Promise<any> {
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
            this.companySettingsService.Get(1, ['CustomerInvoiceReminderSettings','CustomerInvoiceReminderSettings.CustomerInvoiceReminderRules'])
                .subscribe((settings) => {
                    this.settings = settings.CustomerInvoiceReminderSettings;
                    this.settings$.next(this.settings);
                });
        }

        let minimumAmountToRemind = new UniFieldLayout();
        minimumAmountToRemind.EntityType = 'CustomerInvoiceReminderSettings';
        minimumAmountToRemind.Property = 'MinimumAmountToRemind';
        minimumAmountToRemind.FieldType = FieldType.TEXT;
        minimumAmountToRemind.Label = 'Minstebeløp';

        let remindersBeforeDebtCollection = new UniFieldLayout();
        remindersBeforeDebtCollection.EntityType = 'CustomerInvoiceReminderSettings';
        remindersBeforeDebtCollection.Property = 'RemindersBeforeDebtCollection';
        remindersBeforeDebtCollection.FieldType = FieldType.TEXT;
        remindersBeforeDebtCollection.Label = 'Antall purringer før inkasso';

        this.fields$.next([minimumAmountToRemind, remindersBeforeDebtCollection]);
    }
}
