import {Component, ViewChild} from '@angular/core';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import {StatisticsService, CustomerOrderService, ErrorService} from '@app/services/services';
import {HttpParams} from '@angular/common/http';
import {IUniTab} from '@uni-framework/uni-tabs';
import {IUniSaveAction} from '@uni-framework/save/save';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import * as moment from 'moment';
import {BatchInvoiceModal, BatchInvoiceModalOptions} from './batch-invoice-modal/batch-invoice-modal';
import {UniModalService} from '@uni-framework/uni-modal';
import {Router} from '@angular/router';
import {StatusCodeCustomerInvoice, StatusCodeCustomerOrder} from '@uni-entities';
import {tap} from 'rxjs/operators';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';

interface NewBatchInvoiceState {
    entityType: 'CustomerOrder' | 'CustomerInvoice';
    fromDate: Date;
    toDate: Date;
    readyForInvoiceOnly: boolean;
    uncheckedRowMap: any;
}

const STATE_KEY = 'new_batch_invoice_state';

@Component({
    templateUrl: './new-batch-invoice.html',
    styleUrls: ['./new-batch-invoice.sass']
})
export class NewBatchInvoice {
    @ViewChild(AgGridWrapper) table: AgGridWrapper;

    saveaction: IUniSaveAction = {
        label: 'Samlefakturer uttrekk',
        action: (done) => this.runBatchInvoice(done)
    };

    // tabs: IUniTab[] = [
    //     { name: 'Ordre', value: 'CustomerOrder' },
    //     { name: 'Fakturakladd', value: 'CustomerInvoice' }
    // ];

    entityType: 'CustomerOrder' | 'CustomerInvoice';
    entityLabel: string;
    backendCount: number;
    numberOfItems: number;

    params: HttpParams;

    fromDate: Date;
    toDate: Date;
    readyForInvoiceOnly: boolean;

    lookupFunction;
    tableConfig: UniTableConfig;

    uncheckedRowMap = {};

    constructor(
        private router: Router,
        private statisticsService: StatisticsService,
        private orderService: CustomerOrderService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private tabService: TabService
    ) {
        this.tabService.addTab({
            name: 'Ny samlefakturering',
            url: this.router.url,
            moduleID: UniModules.BatchInvoice
        });
    }

    ngOnInit() {
        const savedState: NewBatchInvoiceState = this.getSavedState();
        if (savedState) {
            this.fromDate = savedState.fromDate;
            this.toDate = savedState.toDate;
            this.readyForInvoiceOnly = savedState.readyForInvoiceOnly;
            this.uncheckedRowMap = savedState.uncheckedRowMap || {};
            this.entityType = savedState.entityType || 'CustomerOrder';
        }

        if (!this.entityType) {
            this.entityType = 'CustomerOrder';
        }

        this.init();
    }

    setEntityType(entityType: 'CustomerOrder' | 'CustomerInvoice') {
        if (entityType !== this.entityType) {
            this.uncheckedRowMap = {};
            this.entityType = entityType;
            this.init();
        }
    }

    private init() {
        this.entityLabel = this.entityType  === 'CustomerOrder' ? 'ordre' : 'fakturakladder';
        this.numberOfItems = 0;
        this.initTable();
        this.saveState();
    }

    private initTable() {
        this.tableConfig = this.entityType === 'CustomerOrder' ? this.getOrderTable() : this.getInvoiceTable();
        const modelPrefix = this.entityType === 'CustomerOrder' ? 'Order' : 'Invoice';

        this.lookupFunction = (params: HttpParams) => {
            const selects = [
                'ID as ID',
                `${modelPrefix}Date as ${modelPrefix}Date`,
                'Customer.CustomerNumber as CustomerNumber',
                'CustomerName as CustomerName',
                'DeliveryDate as DeliveryDate',
                'OurReference as OurReference',
                'TaxExclusiveAmountCurrency as TaxExclusiveAmountCurrency',
                'StatusCode as StatusCode',
            ];

            if (this.entityType === 'CustomerOrder') {
                selects.push('RestExclusiveAmountCurrency as RestExclusiveAmountCurrency');
                selects.push('ReadyToInvoice as ReadyToInvoice');
                selects.push('OrderNumber as OrderNumber');
            }

            let filter = this.entityType === 'CustomerOrder'
                // tslint:disable-next-line
                ? `(CustomerOrder.StatusCode eq '${StatusCodeCustomerOrder.Registered}' or CustomerOrder.StatusCode eq '${StatusCodeCustomerOrder.PartlyTransferredToInvoice}')`
                : `(CustomerInvoice.StatusCode eq ${StatusCodeCustomerInvoice.Draft})`;

            filter += ` and CustomerID gt 0`;

            const quickFilters = [];
            if (this.fromDate) {
                quickFilters.push(`${modelPrefix}Date ge '${moment(this.fromDate).format('YYYY-MM-DD')}'`);
            }

            if (this.toDate) {
                quickFilters.push(`${modelPrefix}Date le '${moment(this.toDate).format('YYYY-MM-DD')}'`);
            }

            if (this.entityType === 'CustomerOrder' && this.readyForInvoiceOnly) {
                quickFilters.push(`ReadyToInvoice eq 'true'`);
            }

            if (quickFilters.length) {
                filter += ` and (${quickFilters.join(' and ')})`;
            }

            if (params.has('filter')) {
                filter += ` and ${params.get('filter')}`;
            }

            params = params
                .set('model', this.entityType)
                .set('expand', 'Customer.Info')
                .set('select', selects.join(','))
                .set('filter', filter);

            this.params = params;
            return this.statisticsService.GetAllByHttpParams(params, true).pipe(
                tap(res => {
                    this.backendCount = +res.headers.get('count') || 0;
                    this.updateNumberOfItems();
                })
            );
        };
    }

    private updateNumberOfItems() {
        const uncheckedCount = Object.keys(this.uncheckedRowMap).length || 0;
        this.numberOfItems = (this.backendCount || 0) - uncheckedCount;
    }

    onFilterChange() {
        if (this.table && this.table.dataLoaded) {
            this.table.refreshTableData();
            this.saveState();
        }
    }

    onTableFiltersChange() {
        // Reset checkboxes to avoid numberOfItems calculation being messed up
        this.uncheckedRowMap = {};
    }

    private runBatchInvoice(doneCallback) {
        doneCallback();
        const sumSelect = this.entityType === 'CustomerOrder'
            ? 'RestExclusiveAmountCurrency as Amount'
            : 'TaxExclusiveAmount as Amount';

        let params = this.params
            .set('select', `ID as ID,${sumSelect}`)
            .delete('top');

        // Remove customer expand if there is no customer filter
        // to make the request as "cheap" as possible
        const filter = params.get('filter');
        if (!filter || !filter.includes('Customer.')) {
            params = params.delete('expand');
        }

        this.statisticsService.GetAllByHttpParams(params).subscribe(
            res => {
                const data = (res.body && res.body.Data) || [];
                const itemIDs = [];
                let sum = 0;

                data.forEach(item => {
                    if (!this.uncheckedRowMap[item.ID]) {
                        itemIDs.push(item.ID);
                        sum += item.Amount;
                    }
                });

                this.modalService.open(BatchInvoiceModal, {
                    data: <BatchInvoiceModalOptions> {
                        entityType: this.entityType,
                        itemIDs: itemIDs,
                        sum: sum
                    }
                }).onClose.subscribe(didCreateBatchInvoice => {
                    if (didCreateBatchInvoice) {
                        this.clearSavedState();
                        if (this.table) {
                            this.table.clearLastUsedFilter();
                        }

                        this.router.navigateByUrl('/sales/batch-invoices');
                    }
                });
            },
            err => {
                this.errorService.handle(err);
                doneCallback();
            }
        );
    }

    private getOrderTable() {
        return new UniTableConfig('batch_invoice_orders', false, false)
            .setSearchable(true)
            .setColumns([
                this.getCheckboxColumn(),
                new UniTableColumn(`OrderNumber`, 'Ordrenr.')
                    .setLinkResolver(row => `/sales/orders/${row.ID}`),
                new UniTableColumn('Customer.CustomerNumber', 'Kundenr.')
                    .setAlias('CustomerNumber'),
                new UniTableColumn('CustomerName', 'Kundenavn')
                    .setWidth('15rem'),
                new UniTableColumn(`OrderDate`, 'Ordredato', UniTableColumnType.LocalDate)
                    .setWidth('8rem', false),
                new UniTableColumn('DeliveryDate', 'Leveringsdato', UniTableColumnType.LocalDate)
                    .setWidth('8rem', false),
                new UniTableColumn('OurReference', 'Vår referanse'),
                new UniTableColumn('TaxExclusiveAmountCurrency', 'Sum eks. mva', UniTableColumnType.Money),
                new UniTableColumn('RestExclusiveAmountCurrency', 'Restsum', UniTableColumnType.Money),
                new UniTableColumn('StatusCode', 'Status')
                    .setTemplate(row => this.orderService.getStatusText(row.StatusCode)),
                new UniTableColumn('ReadyToInvoice', 'Klar til fakturering', UniTableColumnType.Boolean)
            ]);
    }

    private getInvoiceTable() {
        return new UniTableConfig('batch_invoice_invoices', false, false)
        .setSearchable(true)
        .setColumns([
            this.getCheckboxColumn(),
            new UniTableColumn('ID', 'Faktura ID')
                .setLinkResolver(row => `/sales/invoices/${row.ID}`),
            new UniTableColumn('Customer.CustomerNumber', 'Kundenr.')
                .setAlias('CustomerNumber'),
            new UniTableColumn('CustomerName', 'Kundenavn')
                .setWidth('15rem'),
            new UniTableColumn(`InvoiceDate`, 'Fakturadato', UniTableColumnType.LocalDate)
                .setWidth('8rem', false),
            new UniTableColumn('DeliveryDate', 'Leveringsdato', UniTableColumnType.LocalDate)
                .setWidth('8rem', false),
            new UniTableColumn('OurReference', 'Vår referanse'),
            new UniTableColumn('TaxExclusiveAmountCurrency', 'Sum eks. mva', UniTableColumnType.Money),
        ]);
    }

    private getCheckboxColumn() {
        return new UniTableColumn('', '', UniTableColumnType.Checkbox).setCheckboxConfig({
            checked: row => {
                console.log(this.uncheckedRowMap);
                return !this.uncheckedRowMap[row.ID];
            },
            onChange: (row, checked) => {
                if (checked && this.uncheckedRowMap[row.ID]) {
                    delete this.uncheckedRowMap[row.ID];
                } else if (!checked) {
                    this.uncheckedRowMap[row.ID] = true;
                }

                this.saveState();
                this.updateNumberOfItems();
            }
        });
    }

    private getSavedState() {
        let state;
        try {
            state = JSON.parse(sessionStorage.getItem(STATE_KEY));
        } catch (e) {}

        return state;
    }

    private clearSavedState() {
        sessionStorage.removeItem(STATE_KEY);
    }

    private saveState() {
        try {
            const state: NewBatchInvoiceState = {
                entityType: this.entityType,
                fromDate: this.fromDate,
                toDate: this.toDate,
                readyForInvoiceOnly: this.readyForInvoiceOnly,
                uncheckedRowMap: this.uncheckedRowMap
            };

            sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
        } catch (e) {}
    }
}
