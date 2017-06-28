import {Component, ViewChild, Input, Output, EventEmitter, AfterViewInit, SimpleChanges} from '@angular/core';
import {Router} from '@angular/router';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from '../../../../../framework/ui/unitable/index';
import {ToastService} from '../../../../../framework/uniToast/toastService';
import {FieldType} from '../../../../../framework/ui/uniform/index';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ErrorService, CustomerInvoiceReminderRuleService} from '../../../../services/services';
import {
    CustomerInvoiceReminderSettings,
    CustomerInvoiceReminderRule,
    FieldLayout
} from '../../../../unientities';
declare const _;

@Component({
    selector: 'reminder-rules',
    templateUrl: './reminderRules.html',
})
export class ReminderRules implements AfterViewInit {
    @ViewChild(UniTable) private table: UniTable;
    @Input() public settings: CustomerInvoiceReminderSettings;
    @Output() public change: EventEmitter<any> = new EventEmitter();

    private rulesTableConfig: UniTableConfig;
    private rule: CustomerInvoiceReminderRule;
    private selectedIndex: number;

    private rule$: BehaviorSubject<CustomerInvoiceReminderRule> = new BehaviorSubject(null);
    private config$: BehaviorSubject<any> = new BehaviorSubject({});
    private fields$: BehaviorSubject<FieldLayout[]> = new BehaviorSubject([]);

    constructor(
        private router: Router,
        private customerInvoiceReminderRuleService: CustomerInvoiceReminderRuleService,
        private errorService: ErrorService,
        private toastService: ToastService
    ) {}

    public ngOnInit() {
        this.setupTable();
        this.setupDetailForm();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['settings'] && changes['settings'].currentValue) {
            if (!this.settings.CustomerInvoiceReminderRules) {
                this.settings.CustomerInvoiceReminderRules = [];
            }
        }
    }

    public ngAfterViewInit() {
        this.focusRow(0);
    }

    private onRowSelected(event) {
        this.selectedIndex = event.rowModel['_originalIndex'];
        this.rule = this.settings.CustomerInvoiceReminderRules[this.selectedIndex];
        this.rule$.next(this.rule);
    }

    private onRuleChange() {
        this.settings.CustomerInvoiceReminderRules[this.selectedIndex] = this.rule$.getValue();
        this.change.emit(this.settings);
    }

    public focusRow(index = undefined) {
        if (this.table) {
            this.table.focusRow(index === undefined ? this.selectedIndex : index);
        }
    }

    private onNewRule() {
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
                Property: 'UseMaximumLegalReminderFee',
                Label: 'Bruk forskriftens makssats',
                FieldType: FieldType.CHECKBOX,
            },
            <any> {
                Property: 'MinimumDaysFromDueDate',
                Label: 'Dager fra forfall',
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
        let reminderNumberCol = new UniTableColumn('ReminderNumber', 'Nr.',  UniTableColumnType.Number)
            .setWidth('12%');
        let titleCol = new UniTableColumn('Title', 'Tittel',  UniTableColumnType.Text);

        let contextMenuItems: IContextMenuItem[] = [];
        contextMenuItems.push({
            label: 'Slett',
            action: (rule: CustomerInvoiceReminderRule) => {
                rule.Deleted = true;
            }
        });
        // Setup table
        this.rulesTableConfig = new UniTableConfig(false, true, 25)
            .setSearchable(false)
            .setContextMenu(contextMenuItems)
            .setColumns([reminderNumberCol, titleCol]);
    }
}
