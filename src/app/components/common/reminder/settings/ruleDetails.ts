import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {CustomerInvoiceReminderRule, FieldType} from '../../../../unientities';
import {UniForm, UniFieldLayout} from 'uniform-ng2/main';
import {
    ErrorService,
    CustomerInvoiceReminderRuleService
} from '../../../../services/services';

declare const moment;

@Component({
    selector: 'reminder-rule-details',
    templateUrl: 'app/components/common/reminder/settings/ruleDetails.html'
})
export class ReminderRuleDetails {
    @Input() public rule: CustomerInvoiceReminderRule;
    @Output() public change: EventEmitter<CustomerInvoiceReminderRule> = new EventEmitter<CustomerInvoiceReminderRule>();

    private config: any = {};
    private fields: any[] = [];

    constructor(private router: Router,
                private errorService: ErrorService,
                private customerInvoiceReminderRuleService: CustomerInvoiceReminderRuleService) {
    }

    public ngOnInit() {
        this.setupForm();
    }

    public onRulesChange(rule) {

    }

    private setupForm() {
        let reminderNumber = new UniFieldLayout();
        reminderNumber.EntityType = 'CustomerInvoiceReminderRule';
        reminderNumber.Property = 'ReminderNumber';
        reminderNumber.FieldType = FieldType.NUMERIC;
        reminderNumber.Label = 'Nr.';

        let title = new UniFieldLayout();
        title.EntityType = 'CustomerInvoiceReminderRule';
        title.Property = 'Title';
        title.FieldType = FieldType.TEXT;
        title.Label = 'Tittel';
        title.LineBreak = true;

        let description = new UniFieldLayout();
        description.EntityType = 'CustomerInvoiceReminderRule';
        description.Property = 'Description';
        description.FieldType = FieldType.TEXTAREA;
        description.Label = 'Beskrivelse';

        let minimumDaysFromDueDate = new UniFieldLayout();
        minimumDaysFromDueDate.EntityType = 'CustomerInvoiceReminderRule';
        minimumDaysFromDueDate.Property = 'MinimumDaysFromDueDate';
        minimumDaysFromDueDate.FieldType = FieldType.NUMERIC;
        minimumDaysFromDueDate.Label = 'Dager fra forfall';
        minimumDaysFromDueDate.LineBreak = true;

        let reminderFee = new UniFieldLayout();
        reminderFee.EntityType = 'CustomerInvoiceReminderRule';
        reminderFee.Property = 'ReminderFee';
        reminderFee.FieldType = FieldType.NUMERIC;
        reminderFee.Label = 'Gebyr';

        let useMaximumLegalReminderFee = new UniFieldLayout();
        useMaximumLegalReminderFee.EntityType = 'CustomerInvoiceReminderRule';
        useMaximumLegalReminderFee.Property = 'UseMaximumLegalReminderFee';
        useMaximumLegalReminderFee.FieldType = FieldType.MULTISELECT;
        useMaximumLegalReminderFee.Label = 'Bruk forskriftens makssats';

        this.fields = [reminderNumber, title, reminderFee, useMaximumLegalReminderFee,
                       minimumDaysFromDueDate, description];
    }
}
