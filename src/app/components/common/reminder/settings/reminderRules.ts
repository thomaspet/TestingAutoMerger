import {Component, ViewChild, Input, SimpleChanges} from '@angular/core';
import {Router} from '@angular/router';
import {CustomerInvoiceReminderSettings, CustomerInvoiceReminderRule} from '../../../../unientities';
import {Observable} from 'rxjs/Observable';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from 'unitable-ng2/main';
import {URLSearchParams} from '@angular/http';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
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
export class ReminderRules {
    @ViewChild(UniTable) private table: UniTable;
    @Input() public settings: CustomerInvoiceReminderSettings;
    private rulesTableConfig: UniTableConfig;
    private rule: CustomerInvoiceReminderRule;
    private selectedIndex: number;
    private rules: any;

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
            this.rules = this.settings.CustomerInvoiceReminderRules;
        }
    }

    private onRowSelected(event) {
        this.rule = event.rowModel;
        this.selectedIndex = event.rowModel['_originalIndex'];
    }

    private onRuleChange(rule: CustomerInvoiceReminderRule) {
        this.settings.CustomerInvoiceReminderRules[this.selectedIndex] = rule;
    }

    private onNewRule() {
        this.customerInvoiceReminderRuleService.GetNewEntity(null, CustomerInvoiceReminderRule.EntityType)
            .subscribe((rule) => {
                rule['_createguid'] = this.customerInvoiceReminderRuleService.getNewGuid();
                this.table.addRow(rule);
                this.table.refreshTableData();
            });
    }

    private setupTable() {
        // Define columns to use in the table
        let reminderNumberCol = new UniTableColumn('ReminderNumber', 'Nr.',  UniTableColumnType.Number).setWidth('12%');
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
