import {Component, Input, Output, EventEmitter} from '@angular/core';
import {CustomerInvoiceReminderRule} from '../../../../unientities';
import {UniFieldLayout, FieldType} from 'uniform-ng2/main';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

declare const moment;

@Component({
    selector: 'reminder-rule-details',
    templateUrl: './ruleDetails.html'
})
export class ReminderRuleDetails {
    @Input() public rule: CustomerInvoiceReminderRule;
    @Output() public change: EventEmitter<CustomerInvoiceReminderRule> = new EventEmitter<CustomerInvoiceReminderRule>();

    private rule$: BehaviorSubject<CustomerInvoiceReminderRule> = new BehaviorSubject(null);
    private config$: BehaviorSubject<any> = new BehaviorSubject({});
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    constructor() {
    }

    public ngOnInit() {
        this.rule$.next(this.rule);
        this.setupForm();
    }

    public ngOnChanges() {
        this.rule$.next(this.rule);
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
        useMaximumLegalReminderFee.FieldType = FieldType.DROPDOWN;
        useMaximumLegalReminderFee.Label = 'Bruk forskriftens makssats';

        this.fields$.next([reminderNumber, title, reminderFee, useMaximumLegalReminderFee,
                       minimumDaysFromDueDate, description]);
    }
}
