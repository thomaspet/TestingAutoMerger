import {Component, ViewChild, Input, Output, EventEmitter, SimpleChanges, OnInit, OnChanges} from '@angular/core';
import {
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig,
} from '@uni-framework/ui/unitable/index';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {FieldType} from '@uni-framework/ui/uniform/index';
import {BehaviorSubject} from 'rxjs';
import {CustomerInvoiceReminderRuleService} from '@app/services/services';
import {
    CustomerInvoiceReminderSettings,
    CustomerInvoiceReminderRule,
    FieldLayout
} from '@uni-entities';

@Component({
    selector: 'reminder-rules',
    templateUrl: './reminderRules.html',
})
export class ReminderRules implements OnInit, OnChanges {

    @ViewChild(AgGridWrapper)
    private table: AgGridWrapper;

    @Input()
    settings: CustomerInvoiceReminderSettings;

    @Input()
    showLabelAbove: boolean = false;

    @Output()
    change: EventEmitter<any> = new EventEmitter();

    private selectedIndex: number;

    rulesTableConfig: UniTableConfig;
    rule$: BehaviorSubject<CustomerInvoiceReminderRule> = new BehaviorSubject(null);
    config$: BehaviorSubject<any> = new BehaviorSubject({});
    fields$: BehaviorSubject<FieldLayout[]> = new BehaviorSubject([]);

    constructor(
        private customerInvoiceReminderRuleService: CustomerInvoiceReminderRuleService
    ) {}

    ngOnInit() {
        this.setupTable();
        this.setupDetailForm();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['settings'] && changes['settings'].currentValue) {
            if (!this.settings.CustomerInvoiceReminderRules) {
                this.settings.CustomerInvoiceReminderRules = [];
            }
            this.settings.CustomerInvoiceReminderRules.sort((a, b) => a.ReminderNumber - b.ReminderNumber);
        }

        if (changes['showLabelAbove']) {
            this.config$.next({ showLabelAbove: this.showLabelAbove});
        }
    }

    setReminderNumber() {
        this.settings.CustomerInvoiceReminderRules = this.settings.CustomerInvoiceReminderRules.map((rule, idx) => {
            rule.ReminderNumber = idx + 1;
            return rule;
        });
        this.change.emit(this.settings);
    }

    onRowSelected(currentCustomerInvoiceReminderRule: CustomerInvoiceReminderRule) {
        this.selectedIndex = currentCustomerInvoiceReminderRule['_originalIndex'];
        this.rule$.next(currentCustomerInvoiceReminderRule);
    }

    onRuleChange() {
        this.settings.CustomerInvoiceReminderRules[this.selectedIndex] = this.rule$.getValue();
        this.change.emit(this.settings);
    }

    onNewRule() {
        this.customerInvoiceReminderRuleService.GetNewEntity(null, CustomerInvoiceReminderRule.EntityType)
            .subscribe((rule) => {
                rule['_createguid'] = this.customerInvoiceReminderRuleService.getNewGuid();
                this.settings.CustomerInvoiceReminderRules.push(rule);
                this.setReminderNumber();
                this.table.focusRow(this.settings.CustomerInvoiceReminderRules.length - 1);
            });
    }

    private setupDetailForm() {
        this.fields$.next([
            <any> {
                Property: 'Title',
                Label: 'Tittel',
                FieldType: FieldType.TEXT,
            },
            <any> {
                Property: 'ReminderFee',
                Label: 'Gebyr',
                FieldType: FieldType.NUMERIC,
            },
            <any> {
                Property: 'MinimumDaysFromDueDate',
                Label: 'Dager fra forfall',
                FieldType: FieldType.NUMERIC,
            },
            <any> {
                Property: 'CreditDays',
                Label: 'Dager til forfall',
                FieldType: FieldType.NUMERIC,
            },
            <any> {
                Property: 'Description',
                Label: 'Beskrivelse',
                FieldType: FieldType.TEXTAREA,
            },
        ]);
    }

    private setupTable() {
        const reminderNumberCol = new UniTableColumn('ReminderNumber', 'Nr.',  UniTableColumnType.Text)
            .setEditable(false)
            .setWidth(45);
        const titleCol = new UniTableColumn('Title', 'Tittel',  UniTableColumnType.Text)
            .setEditable(false);

        this.rulesTableConfig = new UniTableConfig('common.reminder.reminderRules', false, true, 25)
            .setAutofocus(true)
            .setDeleteButton(true)
            .setSearchable(false)
            .setRowDraggable(true)
            .setAutoAddNewRow(false)
            .setColumns([reminderNumberCol, titleCol]);
    }
}
