import {Component, ViewChild, Input, Output, EventEmitter, AfterViewInit, SimpleChanges} from '@angular/core';
import {Router} from '@angular/router';
import {CustomerInvoiceReminderSettings, CustomerInvoiceReminderRule} from '../../../../unientities';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from 'unitable-ng2/main';
import {ToastService} from '../../../../../framework/uniToast/toastService';
import {
    ErrorService,
    CustomerInvoiceReminderRuleService
} from '../../../../services/services';

declare const moment;
declare const _;

@Component({
    selector: 'reminder-rules',
    templateUrl: 'app/components/common/reminder/settings/reminderRules.html',
})
export class ReminderRules implements AfterViewInit {
    @ViewChild(UniTable) private table: UniTable;
    @Input() public settings: CustomerInvoiceReminderSettings;
    @Output() public change: EventEmitter<any> = new EventEmitter();

    private rulesTableConfig: UniTableConfig;
    private rule: CustomerInvoiceReminderRule;
    private selectedIndex: number;

    constructor(private router: Router,
                private customerInvoiceReminderRuleService: CustomerInvoiceReminderRuleService,
                private errorService: ErrorService,
                private toastService: ToastService) {
    }

    public ngOnInit() {
        this.setupTable();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['settings'] && changes['settings'].currentValue) {
            if (!this.settings.CustomerInvoiceReminderRules) {
                this.settings.CustomerInvoiceReminderRules = [];
            }
        }
    }

    private onRowSelected(event) {
        this.selectedIndex = event.rowModel['_originalIndex'];
        this.rule = this.settings.CustomerInvoiceReminderRules[this.selectedIndex];
    }

    private onRuleChange(rule: CustomerInvoiceReminderRule) {
        this.settings.CustomerInvoiceReminderRules[this.selectedIndex] = rule;
        this.change.emit();
    }

    public ngAfterViewInit() {
        this.focusRow(0);
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
