import {Component, OnInit, Input, ViewChild} from '@angular/core';
import { StatisticsService } from '@app/services/common/statisticsService';
import { ErrorService } from '@app/services/common/errorService';
import { IUniTableConfig, UniTableConfig, UniTableColumn, UniTableColumnType, UniTable } from '@uni-framework/ui/unitable';
import { Observable } from 'rxjs/Observable';
import {URLSearchParams} from '@angular/http';

@Component({
    selector: 'workitem-transfer-wizard-filter',
    template: `<uni-table [attr.aria-busy]="busy" *ngIf="initialized" [resource]="dataSource" [config]="tableConfig"
        (rowSelected)="onRowSelected($event)"
        (rowSelectionChanged)="onRowSelectionChanged($event ? $event.rowModel : null)">
    </uni-table>`
})
export class WorkitemTransferWizardFilter implements OnInit {
    @Input() public options: { userId: number, sourceType: string };
    @ViewChild(UniTable) private uniTable: UniTable;

    public selectedItems: Array<{CustomerID: number}>;
    public tableConfig: IUniTableConfig;
    public busy = true;
    public initialized = false;

    constructor(
        private statisticsService: StatisticsService,
        private errorService: ErrorService
    ) {

    }

    public ngOnInit() {
    }

    public onRowSelected(event) {

    }

    public onRowSelectionChanged() {
        this.selectedItems = this.uniTable.getSelectedRows();
    }

    public refresh() {
        this.initialized = true;
        this.busy = true;
        if (this.tableConfig) {
            this.uniTable.refreshTableData();
        } else {
            this.tableConfig = this.createTableConfig();
        }
    }

    public dataSource(query: URLSearchParams) {

        this.busy = true;

        query.set('model', 'workitem');
        query.set('select', 'CustomerID as CustomerID'
            + ',Customer.CustomerNumber as CustomerNumber'
            + ',Info.Name as CustomerName'
            + ',sum(casewhen(minutestoorder ne 0\,minutestoorder\,minutes)) as SumMinutes');
        query.set('expand', 'workrelation.worker,customer.info&orderby=customerid');
        query.set('filter', 'transferedtoorder eq 0 and CustomerID gt 0');
        query.set('orderby', 'customerid');

        return this.statisticsService.GetAllByUrlSearchParams(query, true)
        .finally( () => this.busy = false)
        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    private createTableConfig(): UniTableConfig {
        const cols = [
            new UniTableColumn('CustomerID', 'Nr.', UniTableColumnType.Number).setVisible(false),
            new UniTableColumn('CustomerNumber', 'Kundenr.').setWidth('14%'),
            new UniTableColumn('CustomerName', 'Navn').setWidth('40%'),
            new UniTableColumn('SumMinutes', 'Timer', UniTableColumnType.Number)
                .setWidth('20%').setAlignment('right')
                .setNumberFormat({ decimalLength: 1, decimalSeparator: '.'}),
        ];

        return new UniTableConfig('timetracking.transfer-wizard-filter', false, false)
            .setColumns(cols)
            .setMultiRowSelect(true)
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
