import {Component, ViewChild} from '@angular/core';
import {View} from '../../../models/view/view';
import {UniTableColumn, UniTableColumnType, UniTableConfig, IUniTableConfig, UniTable} from '../../../../framework/ui/unitable/index';
import {UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IToolbarConfig} from '@app/components/common/toolbar/toolbar';
import { StatisticsService, ErrorService } from '@app/services/services';
import { URLSearchParams } from '@angular/http';
import { Alignment } from '@uni-entities';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { ToastService } from '@uni-framework/uniToast/toastService';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { filterInput, safeInt } from '@app/components/common/utils/utils';
export const view = new View('invoice-hours', 'Fakturere timer', 'InvoiceHours', false, 'invoice-hours');

@Component({
    selector: view.name,
    templateUrl: './invoice-hours.html',
    styles: [
        `.less-margin { margin-top: 1em }
         .left-padding { padding-left: 0.5em }
        `
    ]
})
export class InvoiceHours implements OnInit {
    @ViewChild(UniTable) private uniTable: UniTable;
    private textFilter: string;
    private searchControl: FormControl = new FormControl('');
    public dataSource: (value: any) => {};
    public pageSize = 12;
    public limitRows = this.pageSize;
    public rowCount: number = 0;
    public toolbarConfig: IToolbarConfig = {
        title: 'Fakturere/overføre timer',
        omitFinalCrumb: true,
        saveactions: [
            {
                action: () => this.createNew(),
                label: 'Ny overføring'
            }
        ]
    };
    public tableConfig: IUniTableConfig;
    public busy = true;
    public working = false;
    public filters: Array<{ label: string, name: string, isActive: boolean}> = [
        { label: 'Siste time-ordrer', name: 'orders', isActive: true },
        { label: 'Historikk', name: 'history', isActive: false }
    ];

    constructor(
        private statisticsService: StatisticsService,
        private toastService: ToastService,
        private navigator: Router,
        private errorService: ErrorService) {
            this.dataSource = (value) => this.queryInvoiceOrders(value);
    }

    public ngOnInit() {
        this.tableConfig = this.createTableConfig();
        this.searchControl.valueChanges
        .debounceTime(300)
        .subscribe((value: string) => {
            const textValue = filterInput(value);
            if (safeInt(textValue) > 0) {
                this.textFilter = `ordernumber eq ${safeInt(textValue)}`;
            } else {
                this.textFilter = `contains(customername,'${textValue}')`;
            }
            this.limitRows = this.pageSize;
            this.uniTable.refreshTableData();
        });
    }

    private createTableConfig(): UniTableConfig {
        const cols = [
            new UniTableColumn('ID', 'Nr.', UniTableColumnType.Number).setVisible(false),
            new UniTableColumn('OrderNumber', 'Ordrenr.').setWidth('10%'),
            new UniTableColumn('CustomerName', 'Kunde').setWidth('35%').setFilterOperator('startswith'),
            new UniTableColumn('OrderDate', 'Dato', UniTableColumnType.DateTime).setWidth('15%'),
            new UniTableColumn('OurReference', 'Vår referanse').setWidth('20%'),
            new UniTableColumn('TaxExclusiveAmount', 'Nettosum', UniTableColumnType.Money).setWidth('20%').setAlignment('right'),
        ];
        return new UniTableConfig('timetracking.invoice-hours', false, false)
            .setColumns(cols)
            .setDataMapper((data) => {
                this.busy = false;
                const rows = (data && data.Success && data.Data) ? data.Data : [];
                this.rowCount = rows.length;
                return rows;
            });
    }

    public createNew() {

    }

    public onRowSelected(event) {
        if (event.rowModel && event.rowModel.ID) {
            this.working = true;
            this.navigator.navigateByUrl(`/sales/orders/${event.rowModel.ID}`);
        }
    }

    public onFilterClick(filter: { label: string, name: string, isActive: boolean}) {

    }

    public onShowAllClick(on = true) {
        this.limitRows = on ? 0 : this.pageSize;
        this.uniTable.refreshTableData();
    }

    public queryInvoiceOrders(query: URLSearchParams) {

        this.busy = true;

        query.set('model', 'customerorder');

        query.set('select', 'id as ID,ordernumber as OrderNumber,orderdate as OrderDate'
            + ',customername as CustomerName,taxexclusiveamount as TaxExclusiveAmount'
            + ',ourreference as OurReference');

        query.set('join', 'customerorder.id eq customerorderitem.customerorderid'
            + ' and customerorderitem.itemsourceid eq itemsource.id'
            + ' and itemsource.id eq itemsourcedetail.itemsourceid');

        if (this.textFilter) {
            query.set('filter', `itemsourcedetail.sourcetype eq \'WorkItem\' and ( ${this.textFilter} )`);
        } else {
            query.set('filter', 'itemsourcedetail.sourcetype eq \'WorkItem\'');
        }

        if (!query.get('orderby')) {
            query.set('orderby', 'id desc');
        }

        if (this.limitRows) {
            query.set('top', this.limitRows.toString());
        } else {
            query.delete('top');
        }

        return this.statisticsService.GetAllByUrlSearchParams(query, true)
        .finally( () => this.busy = false)
        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }


}

view.component = InvoiceHours;
