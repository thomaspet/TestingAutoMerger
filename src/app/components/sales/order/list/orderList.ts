import {Component, ViewChildren} from 'angular2/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {Router} from 'angular2/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {CustomerOrderService} from '../../../../services/services';
import {CustomerOrder} from '../../../../unientities';

declare var jQuery;

@Component({
    selector: 'order-list',
    templateUrl: 'app/components/sales/order/list/orderList.html',
    directives: [UniTable],
    providers: [CustomerOrderService]
})
export class OrderList {
    @ViewChildren(UniTable) public tables: any;

    private orderTable: UniTableBuilder;
    private selectedorder: CustomerOrder;
   
    constructor(private uniHttpService: UniHttp, private router: Router, private customerOrderService: CustomerOrderService) {
        this.setupOrderTable();
    }

    public createOrder() {        
        /*     
        this.customerOrderService.GetNewEntity().subscribe((s)=> {
            this.customerQouteService.Post(s)
                .subscribe(
                    (data) => {
                        this.router.navigateByUrl('/order/details/' + data.ID);        
                    },
                    (err) => console.log('Error creating order: ', err)
                );        
        });    */
        
        /* OLD VERSION */
        var cq = new CustomerOrder();

        this.customerOrderService.Post(cq)
            .subscribe(
            (data) => {
                console.log('Ordre opprettet, id: ' + data.ID);
                this.router.navigateByUrl('/sales/order/details/' + data.ID);
            },
            (err) => console.log('Error creating order: ', err)
            );
    }

    private setupOrderTable() {
        var self = this;

        // Define columns to use in the table
        var orderNumberCol = new UniTableColumn('OrderNumber', 'Ordrenr', 'string').setWidth('10%');
       
        var customerNumberCol = new UniTableColumn('Customer.CustomerNumber', 'Kundenr', 'string')
            .setNullable(true)
            .setWidth('10%');

        var customerNameCol = new UniTableColumn('CustomerName', 'Kunde', 'string');

        var orderDateCol = new UniTableColumn('OrderDate', 'Ordredato', 'date')
            .setFormat('{0: dd.MM.yyyy}')
            .setWidth('10%');

        var taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Totalsum', 'number')
            .setWidth('10%')
            .setFormat('{0:n}')
            .setClass('column-align-right');

        var statusCol = new UniTableColumn('StatusCode', 'Status', 'number').setWidth('15%');
        statusCol.setTemplate((dataItem) => {
            return this.customerOrderService.getStatusText(dataItem.StatusCode); 
        });

        // Define callback function for row clicks
        var selectCallback = (selectedItem) => {
            this.router.navigateByUrl('/sales/order/details/' + selectedItem.ID);
        };

        // Setup table
        this.orderTable = new UniTableBuilder('orders', false)
            .setFilterable(false)
            .setSelectCallback(selectCallback)
            .setExpand('Customer')
            .setPageSize(25)
            .addColumns( orderNumberCol, customerNumberCol, customerNameCol, orderDateCol, taxInclusiveAmountCol, statusCol)
            .setOrderBy('OrderDate')
            .addCommands({
                name: 'ContextMenu', text: '...', click: (function (event) {
                    event.preventDefault();
                    var dataItem = this.dataItem(jQuery(event.currentTarget).closest('tr'));

                    if (dataItem !== null && dataItem.ID !== null) {
                        self.selectedorder = dataItem;
                        alert('Kontekst meny er under utvikling.');
                    }
                    else {
                        console.log('Error in selecting the SupplierInvoices');
                    }
                })
            });
                               
    }
}
