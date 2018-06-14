import {Component, Input} from '@angular/core';
import {CustomerInvoiceReminderSettings} from '../../../../unientities';
import {FieldType} from '../../../../../framework/ui/uniform/index';
import {UniFieldLayout} from '../../../../../framework/ui/uniform/index';
import {
    CompanySettingsService,
    CustomerInvoiceReminderSettingsService,
    ErrorService
} from '../../../../services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

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
            this.companySettingsService.Get(
                1, ['CustomerInvoiceReminderSettings', 'CustomerInvoiceReminderSettings.CustomerInvoiceReminderRules']
            )
                .subscribe((settings) => {
                    this.settings = settings.CustomerInvoiceReminderSettings;
                    this.settings$.next(this.settings);
                });
        }

        let minimumAmountToRemind = new UniFieldLayout();
        minimumAmountToRemind.EntityType = 'CustomerInvoiceReminderSettings';
        minimumAmountToRemind.Property = 'MinimumAmountToRemind';
        minimumAmountToRemind.FieldType = FieldType.TEXT;
        minimumAmountToRemind.Label = 'Minste fakturabeløp å purre';

        let remindersBeforeDebtCollection = new UniFieldLayout();
        remindersBeforeDebtCollection.EntityType = 'CustomerInvoiceReminderSettings';
        remindersBeforeDebtCollection.Property = 'RemindersBeforeDebtCollection';
        remindersBeforeDebtCollection.FieldType = FieldType.TEXT;
        remindersBeforeDebtCollection.Label = 'Antall purringer før inkasso';

        let acceptPaymentWithoutReminderFee = new UniFieldLayout();
        acceptPaymentWithoutReminderFee.EntityType = 'CustomerInvoiceReminderSettings';
        acceptPaymentWithoutReminderFee.Property = 'AcceptPaymentWithoutReminderFee';
        acceptPaymentWithoutReminderFee.FieldType = FieldType.CHECKBOX;
        acceptPaymentWithoutReminderFee.Label = 'Aksepter fakturabetaling uten purregebyr';

        this.fields$.next([minimumAmountToRemind, remindersBeforeDebtCollection, acceptPaymentWithoutReminderFee]);
    }
}
