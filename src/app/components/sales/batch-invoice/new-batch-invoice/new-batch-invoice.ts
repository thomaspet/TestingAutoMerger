import {Component, ViewChild} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {Router, ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';

import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import {StatisticsService, CustomerOrderService, ErrorService, BrowserStorageService} from '@app/services/services';
import {IUniSaveAction} from '@uni-framework/save/save';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {BatchInvoiceModal, BatchInvoiceModalOptions} from './batch-invoice-modal/batch-invoice-modal';
import {UniModalService} from '@uni-framework/uni-modal';
import {StatusCodeCustomerInvoice, StatusCodeCustomerOrder} from '@uni-entities';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';

import * as moment from 'moment';
import {ToolbarButton, IToolbarConfig} from '@app/components/common/toolbar/toolbar';

interface NewBatchInvoiceState {
    fromDate: Date;
    toDate: Date;
    readyForInvoiceOnly: boolean;
}

const STATE_KEY = 'new_batch_invoice_state';

@Component({
    templateUrl: './new-batch-invoice.html',
    styleUrls: ['./new-batch-invoice.sass']
})
export class NewBatchInvoice {
    @ViewChild(AgGridWrapper) table: AgGridWrapper;

    saveaction: IUniSaveAction;
    toolbarConfig: IToolbarConfig = {
        title: 'Ny samlefakturering',
        buttons: [{
            label: 'Tilbake til liste',
            class: 'secondary',
            action: () => this.router.navigateByUrl('/sales/batch-invoices')
        }]
    };

    entityType: 'CustomerOrder' | 'CustomerInvoice';
    entityLabel: string;

    fromDate: Date;
    toDate: Date;
    readyForInvoiceOnly: boolean;

    items: any[];
    totalRowCount: number;
    selectedItems: any[];
    selectedItemSum: number;

    tableConfig: UniTableConfig;
    queryParamSubscription: Subscription;
    loadSubscription: Subscription;

    constructor(
        private browserStorage: BrowserStorageService,
        private router: Router,
        private route: ActivatedRoute,
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
        this.queryParamSubscription = this.route.queryParamMap.subscribe(params => {
            this.entityType = <any> params.get('entityType') || 'CustomerOrder';
            this.entityLabel = this.entityType  === 'CustomerOrder' ? 'ordre' : 'fakturakladder';
            this.saveaction = {
                label: `Samlefakturer valgte ${this.entityLabel}`,
                action: (done) => this.runBatchInvoice(done),
                disabled: true
            };

            const savedState: NewBatchInvoiceState = this.getSavedState();
            if (savedState) {
                this.fromDate = savedState.fromDate;
                this.toDate = savedState.toDate;
                this.readyForInvoiceOnly = savedState.readyForInvoiceOnly;
            } else {
                this.fromDate = moment().startOf('month').toDate();
                this.toDate = moment().endOf('month').toDate();
            }

            this.tableConfig = this.entityType === 'CustomerOrder' ? this.getOrderTable() : this.getInvoiceTable();
            this.loadData();
        });
    }

    ngOnDestroy() {
        if (this.queryParamSubscription) {
            this.queryParamSubscription.unsubscribe();
        }

        if (this.loadSubscription) {
            this.loadSubscription.unsubscribe();
        }
    }

    onRowSelectionChange(items) {
        this.selectedItems = items || [];
        this.selectedItemSum = this.selectedItems.reduce((total, item) => {
            const amount = this.entityType === 'CustomerOrder' ? item.RestAmountCurrency : item.TaxInclusiveAmountCurrency;
            return total + (amount || 0);
        }, 0);

        this.saveaction.disabled = !this.selectedItems.length;
    }

    onDataLoaded() {
        const data = this.table && this.table.getTableData(true);
        this.totalRowCount = data && data.length || 0;
    }

    onFilterChange() {
        this.loadData();
        this.saveState();
    }

    private runBatchInvoice(doneCallback) {
        doneCallback();

        if (this.selectedItems && this.selectedItems.length) {
            this.modalService.open(BatchInvoiceModal, {
                data: <BatchInvoiceModalOptions> {
                    entityType: this.entityType,
                    itemIDs: this.selectedItems.map(item => item.ID),
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
        }
    }

    private loadData() {
        this.selectedItems = [];
        const modelPrefix = this.entityType === 'CustomerOrder' ? 'Order' : 'Invoice';
        const selects = [
            'ID as ID',
            `${modelPrefix}Date as ${modelPrefix}Date`,
            'Customer.CustomerNumber as CustomerNumber',
            'CustomerName as CustomerName',
            'DeliveryDate as DeliveryDate',
            'OurReference as OurReference',
            'TaxInclusiveAmountCurrency as TaxInclusiveAmountCurrency',
            'StatusCode as StatusCode',
        ];

        if (this.entityType === 'CustomerOrder') {
            selects.push('RestAmountCurrency as RestAmountCurrency');
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

        const params = new HttpParams()
            .set('model', this.entityType)
            .set('expand', 'Customer.Info')
            .set('select', selects.join(','))
            .set('filter', filter);

        if (this.loadSubscription) {
            this.loadSubscription.unsubscribe();
        }

        this.loadSubscription = this.statisticsService.GetAllByHttpParams(params, true).subscribe(
            res => this.items = res.body && res.body.Data || [],
            err => {
                this.errorService.handle(err);
                this.items = [];
            }
        );
    }

    private getOrderTable() {
        return new UniTableConfig('batch_invoice_orders', false)
            .setSearchable(true)
            .setVirtualScroll(true)
            .setMultiRowSelect(true)
            .setHideRowCount(true)
            .setColumns([
                new UniTableColumn(`OrderNumber`, 'Ordrenr.')
                    .setLinkResolver(row => `/sales/orders/${row.ID}`),
                new UniTableColumn('CustomerNumber', 'Kundenr.'),
                new UniTableColumn('CustomerName', 'Kundenavn')
                    .setWidth('15rem'),
                new UniTableColumn(`OrderDate`, 'Ordredato', UniTableColumnType.LocalDate)
                    .setWidth('8rem', false),
                new UniTableColumn('DeliveryDate', 'Leveringsdato', UniTableColumnType.LocalDate)
                    .setWidth('8rem', false),
                new UniTableColumn('OurReference', 'Vår referanse'),
                new UniTableColumn('TaxInclusiveAmountCurrency', 'Sum inkl. mva', UniTableColumnType.Money),
                new UniTableColumn('RestAmountCurrency', 'Restsum', UniTableColumnType.Money),
                new UniTableColumn('StatusCode', 'Status')
                    .setTemplate(row => this.orderService.getStatusText(row.StatusCode)),
                new UniTableColumn('ReadyToInvoice', 'Klar til fakturering', UniTableColumnType.Boolean)
            ]);
    }

    private getInvoiceTable() {
        return new UniTableConfig('batch_invoice_invoices', false, false)
            .setSearchable(true)
            .setVirtualScroll(true)
            .setMultiRowSelect(true)
            .setHideRowCount(true)
            .setColumns([
                new UniTableColumn('ID', 'Faktura ID')
                    .setLinkResolver(row => `/sales/invoices/${row.ID}`),
                new UniTableColumn('CustomerNumber', 'Kundenr.'),
                new UniTableColumn('CustomerName', 'Kundenavn')
                    .setWidth('15rem'),
                new UniTableColumn(`InvoiceDate`, 'Fakturadato', UniTableColumnType.LocalDate)
                    .setWidth('8rem', false),
                new UniTableColumn('DeliveryDate', 'Leveringsdato', UniTableColumnType.LocalDate)
                    .setWidth('8rem', false),
                new UniTableColumn('OurReference', 'Vår referanse'),
                new UniTableColumn('TaxInclusiveAmountCurrency', 'Sum inkl. mva', UniTableColumnType.Money),
            ]);
    }

    private getSavedState() {
        const key = `${STATE_KEY}_${this.entityType}`;
        return this.browserStorage.getSessionItemFromCompany(key);
    }

    private clearSavedState() {
        const key = `${STATE_KEY}_${this.entityType}`;
        this.browserStorage.removeSessionItemFromCompany(key);
    }

    private saveState() {
        try {
            const state: NewBatchInvoiceState = {
                fromDate: this.fromDate,
                toDate: this.toDate,
                readyForInvoiceOnly: this.readyForInvoiceOnly,
            };

            const key = `${STATE_KEY}_${this.entityType}`;
            this.browserStorage.setSessionItemOnCompany(key, state);
        } catch (e) {}
    }
}
