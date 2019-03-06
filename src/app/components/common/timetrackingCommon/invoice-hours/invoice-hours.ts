import {Component, ViewChild} from '@angular/core';
import {UniTableColumn, UniTableColumnType, UniTableConfig, IUniTableConfig} from '@uni-framework/ui/unitable/index';
import {UniModules, TabService} from '@app/components/layout/navbar/tabstrip/tabService';
import {IToolbarConfig} from '@app/components/common/toolbar/toolbar';
import { StatisticsService, ErrorService } from '@app/services/services';
import { URLSearchParams } from '@angular/http';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { filterInput, safeInt } from '@app/components/common/utils/utils';
import { UniModalService, ConfirmActions } from '@uni-framework/uni-modal';
import { WorkitemTransferWizard } from './transfer-wizard';
import { Observable } from 'rxjs';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';

@Component({
    selector: 'invoice-hours',
    templateUrl: './invoice-hours.html',
    styles: [
        `.less-margin { margin-top: 1em }
         .left-padding { padding-left: 0.5em }
        `
    ]
})
export class InvoiceHours implements OnInit {
    @ViewChild(AgGridWrapper) private table: AgGridWrapper;

    private textFilter: string;
    public searchControl: FormControl = new FormControl('');
    public dataSource: (value: any) => {};
    public pageSize = 12;
    public limitRows = this.pageSize;
    public rowCount: number = 0;
    public toolbarConfig: IToolbarConfig = {
        title: 'Fakturere/overføre timer',
        saveactions: [
            {
                action: (done) => this.createNew(done),
                label: 'Ny overføring'
            }
        ]
    };
    public tableConfig: IUniTableConfig;
    public busy = true;
    public working = false;


    private orderStatusCodes = {
        status_0: '0',
        status_undefined: '?',
        status_41001: 'Kladd',
        status_41002: 'Registrert',
        status_41003: 'Delfakturert',
        status_41004: 'Fakturert',
        status_41005: 'Avsluttet'
    };

    constructor(
        private statisticsService: StatisticsService,
        private toastService: ToastService,
        private navigator: Router,
        private errorService: ErrorService,
        tabService: TabService,
        private uniModalService: UniModalService
    ) {
        this.dataSource = (value) => this.queryInvoiceOrders(value);
        tabService.addTab({
            name: 'Fakturering av timer',
            url: '/timetracking/invoice-hours',
            moduleID: UniModules.InvoiceHours,
            active: true
        });
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
            this.table.refreshTableData();
        });
    }

    private createTableConfig(): UniTableConfig {
        const cols = [
            new UniTableColumn('ID', 'Nr.', UniTableColumnType.Number).setVisible(false),
            new UniTableColumn('OrderNumber', 'Ordrenr.'),
            new UniTableColumn('CustomerName', 'Kunde'),
            new UniTableColumn('OrderDate', 'Dato', UniTableColumnType.DateTime),
            new UniTableColumn('OurReference', 'Vår referanse'),
            new UniTableColumn('StatusCode', 'Status')
                .setTemplate(order => order.StatusCode = this.orderStatusCodes['status_' + order.StatusCode]),
            new UniTableColumn('TaxExclusiveAmount', 'Nettosum', UniTableColumnType.Money),
        ];
        return new UniTableConfig('timetracking.invoice-hours', false, false)
            .setColumns(cols);
    }

    public createNew(done: () => {}) {
        this.uniModalService.open(WorkitemTransferWizard,
            {   data: {},
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
            this.working = true;
            this.navigator.navigateByUrl(`/sales/orders/${row.ID}`);
        }
    }

    public onFilterClick(filter: { label: string, name: string, isActive: boolean}) {

    }

    public onShowAllClick(on = true) {
        this.limitRows = on ? 0 : this.pageSize;
        this.table.refreshTableData();
    }

    public queryInvoiceOrders(query: URLSearchParams) {

        this.busy = true;

        query.set('model', 'customerorder');

        query.set('select', 'id as ID'
            + ',ordernumber as OrderNumber'
            + ',orderdate as OrderDate'
            + ',customername as CustomerName'
            + ',taxexclusiveamount as TaxExclusiveAmount'
            + ',statuscode as StatusCode'
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
        .catch((err, obs) => this.handleQueryError(err, obs));
    }

    handleQueryError(err, obs) {
        if (err.status === 403) {
            this.toastService.addToast('Beklager', ToastType.warn
                , 5, 'Du har ikke tilgang til denne funksjonen.');
            return Observable.empty();
        }
        return this.errorService.handleRxCatch(err, obs);
    }

}
