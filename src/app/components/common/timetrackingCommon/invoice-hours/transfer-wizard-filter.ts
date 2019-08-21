import {Component, OnInit, Input, ViewChild} from '@angular/core';
import { IUniTableConfig, UniTableConfig, UniTableColumn, UniTableColumnType, UniTable } from '@uni-framework/ui/unitable';
import {HttpParams} from '@angular/common/http';
import { IWizardOptions, WizardSource } from './wizardoptions';
import { InvoiceHourService, ErrorService } from '@app/services/services';

@Component({
    selector: 'workitem-transfer-wizard-filter',
    template: `<uni-table [attr.aria-busy]="busy" *ngIf="initialized" [resource]="dataLookup" [config]="tableConfig">
    </uni-table>`
})
export class WorkitemTransferWizardFilter implements OnInit {
    @ViewChild(UniTable) private uniTable: UniTable;
    @Input() public options: IWizardOptions;
    public get selectedItems() {
        return this.uniTable.getSelectedRows();
    }
    public tableConfig: IUniTableConfig;
    public busy = true;
    public initialized = false;
    public dataLookup: (params) => {};

    constructor(
        private errorService: ErrorService,
        private invoiceHourService: InvoiceHourService
    ) {

    }

    public ngOnInit() {
    }

    public refresh() {
        this.initialized = true;
        this.busy = true;
        if (this.tableConfig) {
            this.tableConfig = this.createTableConfig();
            this.uniTable.refreshTableData();
        } else {
            this.dataLookup = (params) => this.dataSource(params);
            this.tableConfig = this.createTableConfig();
        }
    }

    public canProceed(): { ok: boolean, msg?: string } {
        const list = <Array<any>>this.selectedItems;
        if (list && list.length > 0) {
            switch (this.options.source) {
                case WizardSource.CustomerHours:
                    break;
                case WizardSource.OrderHours:
                    break;
                case WizardSource.ProjectHours:
                    if (list.findIndex( x => !x.CustomerID) >= 0) {
                        return { ok: false, msg: 'Prosjekt må ha knytning mot kunde for å kunne overføres.' };
                    }
                    break;
            }
            return { ok: true };
        }
        return { ok: false, msg: 'Du har ikke valgt noen som kan overføres.'};
    }

    public dataSource(query: HttpParams) {
        this.busy = true;
        return this.invoiceHourService.getGroupedInvoicableHours(this.options)
        .finally( () => this.busy = false)
        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    private createTableConfig(): UniTableConfig {
        let cols = [];

        switch (this.options.source) {
            default:
            case WizardSource.CustomerHours:
                cols = [
                    new UniTableColumn('CustomerID', 'Nr.', UniTableColumnType.Number).setVisible(false),
                    new UniTableColumn('CustomerNumber', 'Kundenr.').setWidth('14%'),
                    new UniTableColumn('CustomerName', 'Navn').setWidth('40%')
                ];
                break;

            case WizardSource.OrderHours:
                cols = [
                    new UniTableColumn('OrderID', 'Nr.', UniTableColumnType.Number).setVisible(false),
                    new UniTableColumn('OrderNumber', 'Ordrenr.').setWidth('14%'),
                    new UniTableColumn('CustomerName', 'Navn').setWidth('40%')
                ];
                break;

            case WizardSource.ProjectHours:
                cols = [
                    new UniTableColumn('ProjectID', 'Nr.', UniTableColumnType.Number).setVisible(false),
                    new UniTableColumn('ProjectNumber', 'Prosjektnr.').setWidth('15%'),
                    new UniTableColumn('ProjectName', 'Navn').setWidth('40%'),
                    new UniTableColumn('CustomerName', 'Kunde').setWidth('25%')
                ];
                break;
        }

        cols.push(
            new UniTableColumn('SumMinutes', 'Timer', UniTableColumnType.Number)
            .setWidth('20%').setAlignment('right')
            .setNumberFormat({ decimalLength: 2, decimalSeparator: '.', thousandSeparator: ' '})
        );

        return new UniTableConfig('timetracking.transfer-wizard-filter', false, false)
            .setColumns(cols)
            .setMultiRowSelect(true)
            .setDataMapper((data) => {
                this.busy = false;
                const rows = (data && data.Success && data.Data) ? data.Data : [];
                rows.forEach(row => {
                    row.SumMinutes = row.SumMinutes ? row.SumMinutes / 60 : 0;
                    if (this.options.filterByUserID) {
                        row._rowSelected = true;
                    }
                });
                return rows;
            });
    }

}
