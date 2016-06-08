import {Component, ViewChildren, ViewChild} from '@angular/core';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from 'unitable-ng2/main';
import {Router} from '@angular/router-deprecated';
import {CustomerOrderService,ReportDefinitionService} from '../../../../services/services';
import {CustomerOrder} from '../../../../unientities';
import {URLSearchParams} from '@angular/http';
import {PreviewModal} from '../../../reports/modals/preview/previewModal';

declare var jQuery;

@Component({
    selector: 'order-list',
    templateUrl: 'app/components/sales/order/list/orderList.html',
    directives: [UniTable,PreviewModal],
    providers: [CustomerOrderService,ReportDefinitionService]
})
export class OrderList {
    @ViewChildren(UniTable) public tables: any;

    @ViewChild(PreviewModal)
    private previewModal: PreviewModal;

    private orderTable: UniTableConfig;
    private selectedorder: CustomerOrder;
    private lookupFunction: (urlParams: URLSearchParams) => any;
   
    constructor(private router: Router, 
                private customerOrderService: CustomerOrderService, 
                private reportDefinitionService: ReportDefinitionService) {
        this.setupOrderTable();
    }
    
    log(err) {
        alert(err._body);
    }

    createOrder() {
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
            console.log("==2");
            console.log(urlParams);
            let params = urlParams || new URLSearchParams();     
            params.set('expand', 'Customer');
            if (urlParams == null) {
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
            }
        });
        
        contextMenuItems.push({
            label: '-------------',
            action: () => {}
        });

        contextMenuItems.push({
            label: 'Skriv ut',
            action: (order: CustomerOrder) => {
                this.reportDefinitionService.getReportByName('Ordre').subscribe((report) => {
                    this.previewModal.openWithId(report, order.ID);
                });
            }
        });
        
        // Define columns to use in the table
        var orderNumberCol = new UniTableColumn('OrderNumber', 'Ordrenr', UniTableColumnType.Text).setWidth('10%');
        var customerNumberCol = new UniTableColumn('Customer.CustomerNumber', 'Kundenr', UniTableColumnType.Text).setWidth('10%');
        var customerNameCol = new UniTableColumn('CustomerName', 'Kunde', UniTableColumnType.Text);
        var orderDateCol = new UniTableColumn('OrderDate', 'Ordredato', UniTableColumnType.Date).setWidth('10%');

        var taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Totalsum', UniTableColumnType.Number)
            .setWidth('10%')
            .setFormat('{0:n}')
            .setCls('column-align-right');

        var statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number).setWidth('15%');
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
