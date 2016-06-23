import {Component, ViewChildren, ViewChild} from '@angular/core';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from 'unitable-ng2/main';
import {Router} from '@angular/router-deprecated';
import {CustomerOrderService, ReportDefinitionService} from '../../../../services/services';
import {CustomerOrder} from '../../../../unientities';
import {URLSearchParams} from '@angular/http';
import {PreviewModal} from '../../../reports/modals/preview/previewModal';

declare var jQuery;

@Component({
    selector: 'order-list',
    templateUrl: 'app/components/sales/order/list/orderList.html',
    directives: [UniTable, PreviewModal],
    providers: [CustomerOrderService, ReportDefinitionService]
})
export class OrderList {

    @ViewChild(PreviewModal) private previewModal: PreviewModal;
    @ViewChild(UniTable) private table: UniTable;

    private orderTable: UniTableConfig;
    private selectedorder: CustomerOrder;
    private lookupFunction: (urlParams: URLSearchParams) => any;

    constructor(private router: Router,
        private customerOrderService: CustomerOrderService,
        private reportDefinitionService: ReportDefinitionService) {
        this.setupOrderTable();
    }

    private log(err) {
        alert(err._body);
    }

    public createOrder() {
        this.customerOrderService.newCustomerOrder().then(order => {
            this.customerOrderService.Post(order)
                .subscribe(
                (data) => {
                    this.router.navigateByUrl('/sales/order/details/' + data.ID);
                },
                (err) => {
                    console.log('Error creating order: ', err);
                    this.log(err);
                }
                );
        });
    }

    private setupOrderTable() {
        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams || new URLSearchParams();
            params.set('expand', 'Customer, Items');

            if (!params.has('orderby')) {
                params.set('orderby', 'OrderDate desc');
            }

            return this.customerOrderService.GetAllByUrlSearchParams(params);
        }

        // Context menu
        let contextMenuItems: IContextMenuItem[] = [];
        contextMenuItems.push({
            label: 'Rediger',
            action: (order: CustomerOrder) => {
                this.router.navigateByUrl(`/sales/order/details/${order.ID}`);
            },
            disabled: (rowModel) => {
                return false;
            }
        });

        contextMenuItems.push({
            label: '-------------',
            action: () => {}
        });

        contextMenuItems.push({
            label: 'Overf�r hele ordren til faktura',
            action: (order: CustomerOrder) => {
                this.customerOrderService.ActionWithBody(order.ID, order, "transfer-to-invoice").subscribe((invoice) => {
                    console.log('== order ACTION OK ==');
                    alert('Overf�rt til Faktura OK');
                    this.table.refreshTableData();
                }, (err) => {
                    console.log("== TRANSFER-TO-INVOICE FAILED ==");
                    this.log(err);
                });
            },
            disabled: (rowModel) => {
                return !rowModel._links.transitions.transferToInvoice;
            }
        });


        contextMenuItems.push({
            label: 'Avslutt',
            action: (order: CustomerOrder) => {



                this.customerOrderService.Transition(order.ID, order, "complete").subscribe((invoice) => {
                    console.log('== order Transistion OK ==');
                    alert('Overgang til -Avslutt- OK');
                    this.table.refreshTableData();
                }, (err) => {
                    console.log("== TRANSFER-TO-COMPLETED FAILED ==");
                    this.log(err);
                });
            },
            disabled: (rowModel) => {
                return !rowModel._links.transitions.complete;
            }
        });

        contextMenuItems.push({
            label: '-------------',
            action: () => { }
        });

        contextMenuItems.push({
            label: 'Skriv ut',
            action: (order: CustomerOrder) => {
                this.reportDefinitionService.getReportByName('Ordre').subscribe((report) => {
                    if (report) {
                        this.previewModal.openWithId(report, order.ID);
                    }
                });
            },
            disabled: (rowModel) => {
                return false;
            }
        });

        // Define columns to use in the table
        var orderNumberCol = new UniTableColumn('OrderNumber', 'Ordrenr', UniTableColumnType.Text).setWidth('10%').setFilterOperator('contains');
        var customerNumberCol = new UniTableColumn('Customer.CustomerNumber', 'Kundenr', UniTableColumnType.Text).setWidth('10%').setFilterOperator('contains');
        var customerNameCol = new UniTableColumn('CustomerName', 'Kundenavn', UniTableColumnType.Text).setFilterOperator('contains');
        var orderDateCol = new UniTableColumn('OrderDate', 'Ordredato', UniTableColumnType.Date).setWidth('10%').setFilterOperator('eq');

        var taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Totalsum', UniTableColumnType.Number)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setCls('column-align-right');

        var statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number).setWidth('15%');
        statusCol.setFilterable(false);
        statusCol.setTemplate((dataItem) => {
            return this.customerOrderService.getStatusText(dataItem.StatusCode);
        });

        // Setup table
        this.orderTable = new UniTableConfig(false, true)
            .setPageSize(25)
            .setSearchable(true)
            .setColumns([orderNumberCol, customerNumberCol, customerNameCol, orderDateCol, taxInclusiveAmountCol, statusCol])
            .setContextMenu(contextMenuItems);
    }

    private onRowSelected(event) {
        this.router.navigateByUrl(`/sales/order/details/${event.rowModel.ID}`);
    }
}
