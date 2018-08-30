import {Component, Input, Output, EventEmitter, SimpleChanges} from '@angular/core';
import {FieldType} from '../../../../../framework/ui/uniform/index';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {
    DebtCollectionSettings,
    CustomerInvoiceReminderSettings,
} from '../../../../unientities';
declare const _;

@Component({
    selector: 'debt-collection-settings',
    templateUrl: './debtCollectionSettings.html',
})
export class DebtCollectionSetting {
    @Input() public settings: CustomerInvoiceReminderSettings;
    @Output() public change: EventEmitter<any> = new EventEmitter();

    debtCollectionSettings$: BehaviorSubject<DebtCollectionSettings> = new BehaviorSubject(null);
    settings$: BehaviorSubject<CustomerInvoiceReminderSettings> = new BehaviorSubject(null);
    fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    ngOnChanges(changes: SimpleChanges) {
        if (changes['settings'] && this.settings) {
            if (!this.settings.DebtCollectionSettings) {
                this.settings.DebtCollectionSettings = <DebtCollectionSettings> {}
            }

            this.debtCollectionSettings$.next(this.settings.DebtCollectionSettings);
            this.setupDetailForm();
        }
    }

    onChange() {
        const debtCollectionSettings = this.debtCollectionSettings$.getValue();
        this.settings.DebtCollectionSettings = debtCollectionSettings;
        this.change.emit(this.settings);
    }

    private setupDetailForm() {
        this.fields$.next([
            <any> {
                Property: 'IntegrateWithDebtCollection',
                Label: 'Integrasjon med inkasso',
                FieldType: FieldType.CHECKBOX,
            },
            <any> {
                Property: 'DebtCollectionAutomationID',
                Label: 'Automatisering',
                FieldType: FieldType.DROPDOWN,
                
                Options: {
                    source: this.settings.DebtCollectionSettings.DebtCollectionAutomation,
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
            <any> {
                Property: 'CreditorNumber',
                Label: 'Vårt kundenr hos inkassobyrå',
                FieldType: FieldType.TEXT,
            }
        ]);
    }
}
