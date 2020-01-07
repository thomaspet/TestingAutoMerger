import {Component, ViewChild} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {Router} from '@angular/router';

import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {UniTableColumn, UniTableColumnType, UniTableConfig, IUniTableConfig} from '@uni-framework/ui/unitable/index';
import {UniModules, TabService} from '@app/components/layout/navbar/tabstrip/tabService';
import {StatisticsService} from '@app/services/services';
import {UniModalService, ConfirmActions} from '@uni-framework/uni-modal';
import {WorkitemTransferWizard} from './transfer-wizard';

@Component({
    selector: 'invoice-hours',
    templateUrl: './invoice-hours.html',
    styleUrls: ['./invoice-hours.sass']
})
export class InvoiceHours {
    @ViewChild(AgGridWrapper, { static: true }) private table: AgGridWrapper;

    saveactions = [{ label: 'Ny overføring', action: (done) => this.createNew(done) }];
    dataSource;
    tableConfig: IUniTableConfig;

    private statusCodes = [
        {code: 41001, label: 'Kladd'},
        {code: 41002, label: 'Registrert'},
        {code: 41003, label: 'Delfakturert'},
        {code: 41004, label: 'Fakturert'},
        {code: 41005, label: 'Avsluttet'},
    ];

    constructor(
        private statisticsService: StatisticsService,
        private router: Router,
        private uniModalService: UniModalService,
        private tabService: TabService
    ) {
        this.tableConfig = this.createTableConfig();
        this.dataSource = (params) => this.queryInvoiceOrders(params);
        this.tabService.addTab({
            name: 'Fakturering av timer',
            url: '/timetracking/invoice-hours',
            moduleID: UniModules.InvoiceHours,
            active: true
        });
    }

    private createTableConfig(): UniTableConfig {
        const cols = [
            new UniTableColumn('ID', 'Nr.', UniTableColumnType.Number).setVisible(false),
            new UniTableColumn('OrderNumber', 'Ordrenr.'),
            new UniTableColumn('CustomerName', 'Kunde'),
            new UniTableColumn('OrderDate', 'Dato', UniTableColumnType.DateTime),
            new UniTableColumn('OurReference', 'Vår referanse'),
            new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number)
                .setTemplate(order => {
                    const statusCode = order.StatusCode && this.statusCodes.find(s => s.code === order.StatusCode);
                    return statusCode && statusCode.label;
                })
                .setFilterSelectConfig({
                    options: this.statusCodes,
                    displayField: 'label',
                    valueField: 'code'
                }),
            new UniTableColumn('TaxExclusiveAmount', 'Nettosum', UniTableColumnType.Money),
        ];

        return new UniTableConfig('timetracking.invoice-hours', false, true, 20)
            .setSearchable(true)
            .setColumns(cols);
    }

    public createNew(done: () => {}) {
        this.uniModalService.open(WorkitemTransferWizard, {
            data: {},
            header: 'Overføring av timer',
            message: 'Overføring av timer'
        }).onClose.subscribe(modalResult => {
            done();
            if (modalResult === ConfirmActions.ACCEPT) {
                this.table.refreshTableData();
            }
        });
    }

    public onRowSelected(row) {
        if (row.ID) {
            this.router.navigateByUrl(`/sales/orders/${row.ID}`);
        }
    }

    public queryInvoiceOrders(query: HttpParams) {
        query = query.set('model', 'customerorder');
        query = query.set('select', 'id as ID'
            + ',ordernumber as OrderNumber'
            + ',orderdate as OrderDate'
            + ',customername as CustomerName'
            + ',taxexclusiveamount as TaxExclusiveAmount'
            + ',statuscode as StatusCode'
            + ',ourreference as OurReference'
            // The line below is needed to avoid duplicates (due to join and top)
            + ',stuff(itemsourcedetail.itemsourceid) as ItemSourceIds'
        );

        query = query.set('join', 'customerorder.id eq customerorderitem.customerorderid'
            + ' and customerorderitem.itemsourceid eq itemsource.id'
            + ' and itemsource.id eq itemsourcedetail.itemsourceid');


        let filter = `itemsourcedetail.sourcetype eq \'WorkItem\'`;
        if (query.get('filter')) {
            filter += ` and ${query.get('filter')}`;
        }

        query = query.set('filter', filter);

        if (!query.get('orderby')) {
            query = query.set('orderby', 'id desc');
        }

        return this.statisticsService.GetAllByHttpParams(query, true);
    }
}
