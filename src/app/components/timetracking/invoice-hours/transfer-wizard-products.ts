import {Component, OnInit, Input, ViewChild} from '@angular/core';
import { StatisticsService } from '@app/services/common/statisticsService';
import { ErrorService } from '@app/services/common/errorService';
import { IUniTableConfig, UniTableConfig, UniTableColumn, UniTableColumnType, UniTable } from '@uni-framework/ui/unitable';
import { Observable } from 'rxjs/Observable';
import {URLSearchParams} from '@angular/http';
import { IWizardOptions, WizardSource } from './wizardoptions';
import { ProductService } from '@app/services/services';
import { filterInput } from '@app/components/common/utils/utils';
import { ValueItem } from '@app/services/timetracking/timesheetService';
import { InvoiceHourService } from './invoice-hours.service';

@Component({
    selector: 'workitem-transfer-wizard-products',
    template: `<uni-table [attr.aria-busy]="busy" *ngIf="initialized" [resource]="dataLookup" [config]="tableConfig"
        (rowSelected)="onRowSelected($event)"
        (rowSelectionChanged)="onRowSelectionChanged($event ? $event.rowModel : null)">
    </uni-table>`
})
export class WorkitemTransferWizardProducts implements OnInit {
    @ViewChild(UniTable) private uniTable: UniTable;
    @Input() public options: IWizardOptions;
    public tableConfig: IUniTableConfig;
    public busy = true;
    public initialized = false;
    public dataLookup: (params) => {};

    constructor(
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
        private productService: ProductService,
        private invoiceHourService: InvoiceHourService
    ) {

    }

    public ngOnInit() {
    }

    public onRowSelected(event) {

    }

    public get selectedItems() {
        return this.uniTable.getTableData();
    }

    public refresh() {
        this.initialized = true;
        this.busy = true;
        if (this.tableConfig) {
            this.uniTable.refreshTableData();
        } else {
            this.dataLookup = (params) => this.dataSource(params);
            this.tableConfig = this.createTableConfig();
        }
    }

    public canProceed(): { ok: boolean, msg?: string } {
        const list = <Array<any>>this.selectedItems;
        if (list && list.length > 0) {
            if (list.findIndex( x => !x.ProductID) >= 0) {
                return { ok: false, msg: 'Du må angi produkt/pris for alle timearter som skal overføres.' };
            }
            return { ok: true };
        }
        return { ok: false, msg: 'Du har ikke valgt noe som kan overføres.'};
    }

    public dataSource(query: URLSearchParams) {
        this.busy = true;
        return this.invoiceHourService.getWorkTypeWithProducts(this.options)
        .finally( () => this.busy = false)
        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    private createTableConfig(): UniTableConfig {
        const cols = [
            new UniTableColumn('WorktypeID', 'Art.nr.', UniTableColumnType.Number).setVisible(false),
            new UniTableColumn('WorktypeName', 'Timeart').setWidth('30%').setEditable(false),
            new UniTableColumn('PartName', 'Produktnr.', UniTableColumnType.Lookup).setWidth('15%')
                .setDisplayField('PartName')
                .setOptions({
                    itemTemplate: item => `${item['PartName']} - ${item['Name']}`,
                    lookupFunction: txt => this.lookupProduct(txt)
                }),
            new UniTableColumn('ProductName', 'Produktnavn').setWidth('30%').setEditable(false),
            new UniTableColumn('PriceExVat', 'Pris', UniTableColumnType.Money)
                .setWidth('20%').setAlignment('right')
        ];

        return new UniTableConfig('timetracking.transfer-wizard-products', false, false)
            .setColumns(cols)
            .setEditable(true)
            .setAutoAddNewRow(false)
            .setSortable(true)
            .setChangeCallback( changeEvent => this.onEditChange(changeEvent) )
            .setDataMapper((data) => {
                this.busy = false;
                const rows = (data && data.Success && data.Data) ? data.Data : [];
                rows.forEach(row => {
                    row.SumMinutes = row.SumMinutes ? row.SumMinutes / 60 : 0;
                });
                return rows;
            });
    }

    private lookupProduct(txt: string) {
        const params = new URLSearchParams();
        const value = filterInput(txt);
        params.set('filter', `partname eq '${value}' or startswith(name,'${value}')`);
        params.set('top', '50');
        params.set('hateoas', 'false');
        params.set('select', 'ID,Partname,Name,PriceExVat,VatTypeID,Unit');
        return this.productService.GetAllByUrlSearchParams(params).map( result => result.json() );
    }

    private onEditChange(event: { originalIndex: number, field: string, rowModel: IWorkProduct }) {
        const change = new ValueItem(event.field, event.rowModel[event.field], event.originalIndex);
        switch (event.field) {
            case 'PartName':
                if (change.value && change.value.ID) {
                    event.rowModel['ProductID'] = change.value.ID;
                    event.rowModel['PartName'] = change.value.PartName;
                    event.rowModel['ProductName'] = change.value.Name;
                    event.rowModel['PriceExVat'] = change.value.PriceExVat;
                    event.rowModel['VatTypeID'] = change.value.VatTypeID;
                    event.rowModel['Unit'] = change.value.Unit;
                }
                break;
        }
        return event.rowModel;
    }
}

export interface IWorkProduct {
    WorktypeID: number;
    WorktypeName: string;
    PriceExVat: number;
    PartName: string;
    ProductID: number;
    VatTypeID: number;
    ProductName: string;
    Unit: string;
}
