import {Component, ViewChild, Input, Output, EventEmitter, AfterViewInit, SimpleChanges, OnInit, OnChanges} from '@angular/core';
import {
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig,
} from '@uni-framework/ui/unitable/index';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {FieldType} from '@uni-framework/ui/uniform/index';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
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
export class ReminderRules implements OnInit, OnChanges, AfterViewInit {
    @ViewChild(AgGridWrapper) private table: AgGridWrapper;
    @Input() settings: CustomerInvoiceReminderSettings;
    @Output() change: EventEmitter<any> = new EventEmitter();

    rulesTableConfig: UniTableConfig;
    private rule: CustomerInvoiceReminderRule;
    private selectedIndex: number;

    rule$: BehaviorSubject<CustomerInvoiceReminderRule> = new BehaviorSubject(null);
    config$: BehaviorSubject<any> = new BehaviorSubject({});
    fields$: BehaviorSubject<FieldLayout[]> = new BehaviorSubject([]);

    constructor(private customerInvoiceReminderRuleService: CustomerInvoiceReminderRuleService) {}

    ngOnInit() {
        this.setupTable();
        this.setupDetailForm();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['settings'] && changes['settings'].currentValue) {
            if (!this.settings.CustomerInvoiceReminderRules) {
                this.settings.CustomerInvoiceReminderRules = [];
            }
        }
    }

    ngAfterViewInit() {
        this.focusRow(0);
    }

    onRowSelected(event) {
        this.selectedIndex = event['_originalIndex'];
        this.rule = this.settings.CustomerInvoiceReminderRules[this.selectedIndex];
        this.rule$.next(this.rule);
    }

    onRuleChange() {
        this.settings.CustomerInvoiceReminderRules[this.selectedIndex] = this.rule$.getValue();
        this.change.emit(this.settings);
    }

    focusRow(index?: number) {
        if (this.table) {
            this.table.focusRow(index === undefined ? this.selectedIndex : index);
        }
    }

    onNewRule() {
        this.customerInvoiceReminderRuleService.GetNewEntity(null, CustomerInvoiceReminderRule.EntityType)
            .subscribe((rule) => {
                rule['_createguid'] = this.customerInvoiceReminderRuleService.getNewGuid();
                this.table.addRow(rule);
                this.table.refreshTableData();
                this.change.emit();
            });
    }

    private setupDetailForm() {
        this.fields$.next([
            <any> {
                Property: 'ReminderNumber',
                Label: 'Nr.',
                FieldType: FieldType.NUMERIC,
            },
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
        // Define columns to use in the table
        const reminderNumberCol = new UniTableColumn('ReminderNumber', 'Nr.',  UniTableColumnType.Number)
            .setWidth(40);
        const titleCol = new UniTableColumn('Title', 'Tittel',  UniTableColumnType.Text);

        // Setup table
        this.rulesTableConfig = new UniTableConfig('common.reminder.reminderRules', false, true, 25)
            .setDeleteButton(true)
            .setSearchable(false)
            .setColumns([reminderNumberCol, titleCol]);
    }
}
