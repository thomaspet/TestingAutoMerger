import {Component, Input, ViewChild} from '@angular/core';
import { IUniTableConfig, UniTableConfig, UniTableColumn, UniTableColumnType, UniTable } from '@uni-framework/ui/unitable';
import { IWizardOptions } from './wizardoptions';
import { ErrorService, InvoiceHourService } from '@app/services/services';

@Component({
    selector: 'workitem-transfer-wizard-products',
    template: `<uni-table [attr.aria-busy]="busy" *ngIf="initialized" [resource]="dataLookup" [config]="tableConfig">
    </uni-table>`
})
export class WorkitemTransferWizardProducts {
    @ViewChild(UniTable) private uniTable: UniTable;
    @Input() options: IWizardOptions;

    busy = true;
    dataLookup: (params) => {};
    initialized = false;
    tableConfig: IUniTableConfig;

    constructor(private errorService: ErrorService, private invoiceHourService: InvoiceHourService) {}

    canProceed(): { ok: boolean, msg?: string } {
        const list = <Array<any>>this.selectedItems;
        if (list && list.length > 0) {
            if (list.findIndex( x => x._rowSelected && !x.ProductID   ) >= 0) {
                return { ok: false, msg: 'Du må angi produkt/pris for alle timearter som skal overføres.' };
            }
            return { ok: true };
        }
        return { ok: false, msg: 'Du har ikke valgt noe som kan overføres.'};
    }

    refresh() {
        this.initialized = true;
        this.busy = true;
        if (this.tableConfig) {
            this.uniTable.refreshTableData();
        } else {
            this.dataLookup = () => this.dataSource();
            this.tableConfig = this.createTableConfig();
        }
    }

    get selectedItems() {
        const all = this.uniTable.getTableData();
        return all.filter( x => x._rowSelected);
    }

    private createTableConfig(): UniTableConfig {
        const cols = [
            new UniTableColumn('WorkTypeID', 'Art.nr.', UniTableColumnType.Number).setVisible(false),
            new UniTableColumn('WorktypeName', 'Timeart').setWidth('30%').setEditable(false),
            new UniTableColumn('PartName', 'Produktnr.', UniTableColumnType.Lookup).setWidth('15%')
                .setDisplayField('PartName')
                .setOptions({
                    itemTemplate: item => `${item['PartName']} - ${item['Name']}`,
                    lookupFunction: txt => this.invoiceHourService.lookupProduct(txt),
                }),
            new UniTableColumn('ProductName', 'Produktnavn').setWidth('30%').setEditable(false),
            new UniTableColumn('PriceExVat', 'Pris', UniTableColumnType.Money)
                .setWidth('20%').setAlignment('right')
        ];

        return new UniTableConfig('timetracking.transfer-wizard-products', false, false)
            .setColumns(cols)
            .setEditable(true)
            .setAutoAddNewRow(false)
            .setMultiRowSelect(true)
            .setSortable(true)
            .setChangeCallback( changeEvent => this.invoiceHourService.onEditChange(changeEvent) )
            .setDataMapper((data) => {
                this.busy = false;
                const rows = (data && data.Success && data.Data) ? data.Data : [];
                rows.forEach(row => {
                    row.SumMinutes = row.SumMinutes ? row.SumMinutes / 60 : 0;
                    row._rowSelected = !!row.PartName;
                });
                return rows;
            });
    }

    private dataSource() {
        this.busy = true;
        return this.invoiceHourService.getWorkTypeWithProducts(this.options)
        .finally(() => this.busy = false)
        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }
}
