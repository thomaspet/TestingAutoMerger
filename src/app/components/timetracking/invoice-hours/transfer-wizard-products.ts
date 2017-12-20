import {Component, OnInit, Input, ViewChild} from '@angular/core';
import { StatisticsService } from '@app/services/common/statisticsService';
import { ErrorService } from '@app/services/common/errorService';
import { IUniTableConfig, UniTableConfig, UniTableColumn, UniTableColumnType, UniTable } from '@uni-framework/ui/unitable';
import { Observable } from 'rxjs/Observable';
import {URLSearchParams} from '@angular/http';
import { IWizardOptions } from './wizardoptions';

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
    // public selectedItems: Array<{WorktypeID: number, PartName: string, PriceExVat: number}>;
    public tableConfig: IUniTableConfig;
    public busy = true;
    public initialized = false;
    public dataLookup: (params) => {};

    constructor(
        private statisticsService: StatisticsService,
        private errorService: ErrorService
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

    public dataSource(query: URLSearchParams) {

        this.busy = true;

        query.set('model', 'workitem');
        query.set('select', 'sum(casewhen(minutestoorder ne 0\,minutestoorder\,minutes)) as SumMinutes'
            + ',Worktype.ID as WorktypeID'
            + ',WorkType.Name as WorktypeName'
            + ',casewhen(WorkType.Price ne 0\,WorkType.Price\,Product.PriceExVat) as PriceExVat'
            + ',Product.PartName as PartName'
            + ',Product.ID as ProductID'
            + ',Product.Name as ProductName');
        query.set('expand', 'workrelation.worker,worktype.product');
        query.set('orderby', 'worktype.name');
        query.set('filter', 'transferedtoorder eq 0 and CustomerID gt 0');

        if (this.options) {
            if (this.options.selectedCustomers && this.options.selectedCustomers.length > 0) {
                const list = [];
                for (let i = 0; i < this.options.selectedCustomers.length; i++) {
                    list.push(`customerid eq ${this.options.selectedCustomers[i].CustomerID}`);
                }
                query.set('filter', `${query.get('filter')} and (${list.join(' or ')})`);
            }
            if (this.options.filterByUserID) {
                query.set('filter', `${query.get('filter')} and worker.userid eq ${this.options.filterByUserID}`);
            }
        }

        return this.statisticsService.GetAllByUrlSearchParams(query, true)
        .finally( () => this.busy = false)
        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    private createTableConfig(): UniTableConfig {
        const cols = [
            new UniTableColumn('WorktypeID', 'Art.nr.', UniTableColumnType.Number).setVisible(false),
            new UniTableColumn('WorktypeName', 'Timeart').setWidth('30%').setEditable(false),
                new UniTableColumn('PartName', 'ProduktNr.').setWidth('15%'),
            new UniTableColumn('ProductName', 'Produktnavn').setWidth('30%').setEditable(false),
            new UniTableColumn('PriceExVat', 'Pris', UniTableColumnType.Money)
                .setWidth('20%').setAlignment('right')
        ];

        return new UniTableConfig('timetracking.transfer-wizard-products', false, false)
            .setColumns(cols)
            .setEditable(true)
            .setAutoAddNewRow(false)
            .setSortable(true)
            .setDataMapper((data) => {
                this.busy = false;
                const rows = (data && data.Success && data.Data) ? data.Data : [];
                rows.forEach(row => {
                    row.SumMinutes = row.SumMinutes ? row.SumMinutes / 60 : 0;
                });
                return rows;
            });
    }

}
