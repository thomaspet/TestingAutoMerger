import {Component, OnInit, Input, ViewChild} from '@angular/core';
import { StatisticsService } from '@app/services/common/statisticsService';
import { ErrorService } from '@app/services/common/errorService';
import { IUniTableConfig, UniTableConfig, UniTableColumn, UniTableColumnType, UniTable } from '@uni-framework/ui/unitable';
import { Observable } from 'rxjs/Observable';
import {URLSearchParams} from '@angular/http';
import { IWizardOptions, WizardSource } from './wizardoptions';

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
        private statisticsService: StatisticsService,
        private errorService: ErrorService
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

    public dataSource(query: URLSearchParams) {

        this.busy = true;
        query.set('model', 'workitem');
        query.delete('join');

        switch (this.options.source) {
            default:
            case WizardSource.CustomerHours:
                query.set('select', 'CustomerID as CustomerID'
                    + ',Customer.CustomerNumber as CustomerNumber'
                    + ',Info.Name as CustomerName'
                    + ',sum(casewhen(minutestoorder ne 0\,minutestoorder\,minutes)) as SumMinutes');
                query.set('expand', 'workrelation.worker,customer.info');
                query.set('orderby', 'info.name');
                query.set('filter', 'transferedtoorder eq 0 and CustomerID gt 0');
                break;

            case WizardSource.OrderHours:
                query.set('select', 'CustomerOrderID as OrderID'
                    + ',CustomerOrder.OrderNumber as OrderNumber'
                    + ',CustomerOrder.CustomerName as CustomerName'
                    + ',CustomerOrder.CustomerID as CustomerID'
                    + ',sum(casewhen(minutestoorder ne 0\,minutestoorder\,minutes)) as SumMinutes');
                query.set('expand', 'workrelation.worker,customerorder');
                query.set('orderby', 'CustomerOrderID desc');
                query.set('filter', 'transferedtoorder eq 0 and CustomerOrderID gt 0');
                break;

            case WizardSource.ProjectHours:
                query.set('select', 'Dimensions.ProjectID as ProjectID'
                    + ',Project.ProjectNumber as ProjectNumber'
                    + ',Project.Name as ProjectName'
                    + ',businessrelation.Name as CustomerName'
                    + ',customer.ID as CustomerID'
                    + ',sum(casewhen(minutestoorder ne 0\,minutestoorder\,minutes)) as SumMinutes');
                query.set('expand', 'workrelation.worker,dimensions.project');
                query.set('join', 'dimensions.projectid eq project.id'
                    + ' and project.projectcustomerid eq customer.id'
                    + ' and customer.businessrelationid eq businessrelation.id');
                query.set('orderby', 'dimensions.projectid desc');
                query.set('filter', 'transferedtoorder eq 0 and dimensions.projectid gt 0');
                break;
        }

        if (this.options && this.options.filterByUserID) {
            query.set('filter', `${query.get('filter')} and worker.userid eq ${this.options.filterByUserID}`);
        }

        return this.statisticsService.GetAllByUrlSearchParams(query, true)
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
            .setNumberFormat({ decimalLength: 1, decimalSeparator: '.', thousandSeparator: ' '})
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
