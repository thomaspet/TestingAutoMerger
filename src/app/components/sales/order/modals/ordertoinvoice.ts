import {Component, Type, Input, Output, ViewChild, EventEmitter} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {UniModal} from '../../../../../framework/modals/modal';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';

import {CustomerOrderService, ProductService} from '../../../../services/services';
import {StatusCodeCustomerOrderItem} from '../../../../unientities';
import {CustomerOrder, CustomerOrderItem} from '../../../../unientities';

@Component({
    selector: 'order-to-invoice-table',
    template: `
    <span *ngIf="order && orderItemTable">
        <uni-table  [resource]="order.Items"
                    [config]="orderItemTable"
                    (rowSelectionChanged)="onRowSelectionChange($event)">
        </uni-table>
    </span>
    `
})
export class OrderToInvoiceTable {
    @ViewChild(UniTable) public table: UniTable;
    @Input() public order: CustomerOrder;
    public selectedItems: CustomerOrderItem[];
    private orderItemTable: UniTableConfig;

    constructor(
        private productService: ProductService) {
    }

    public ngOnInit() {
        this.selectedItems = [];
        this.setupUniTable();
    }

    private setupUniTable() {
        var productNrCol = new UniTableColumn('Product.PartName', 'Produktnr', UniTableColumnType.Text);
        var productNameCol = new UniTableColumn('Product.Name', 'Produktnavn', UniTableColumnType.Text);
        let numItemsCol = new UniTableColumn('NumberOfItems', 'Antall', UniTableColumnType.Number);

        // Setup table        
        this.orderItemTable = new UniTableConfig(false, true, 10)
            .setColumns([
                productNrCol, productNameCol, numItemsCol
            ])
            .setMultiRowSelect(true);
    }

    public onRowSelectionChange(event) {
        this.selectedItems = this.table.getSelectedRows();
    }
}

// order-to-invoice modal type
@Component({
    selector: 'order-to-invoice-modal-type',
    template: `
        <article class="modal-content address-modal" *ngIf="config">
            <h1 *ngIf="config.title">{{config.title}}</h1>

            <order-to-invoice-table [order]="config.model"> </order-to-invoice-table>

            <footer>
                <button *ngFor="let action of config.actions; let i=index" (click)="action.method()" [ngClass]="action.class">
                    {{action.text}}
                </button>
            </footer>
        </article>
    `
})
export class OrderToInvoiceModalType {
    @Input() public config: any;
    @ViewChild(OrderToInvoiceTable) public form: OrderToInvoiceTable;
}

// order to invoice modal
@Component({
    selector: 'order-to-invoice-modal',
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `
})
export class OrderToInvoiceModal {
    @Input() public order: CustomerOrder;
    @ViewChild(UniModal) public modal: UniModal;

    @Output() public changed: EventEmitter<CustomerOrderItem[]>= new EventEmitter<CustomerOrderItem[]>();
    @Output() public canceled: EventEmitter<boolean> = new EventEmitter<boolean>();

    private modalConfig: any = {};
    public type: Type = OrderToInvoiceModalType;

    constructor(private customerOrderService: CustomerOrderService) {
        var self = this;
        this.modalConfig = {
            title: '',
            mode: null,

            actions: [
                {
                    text: 'Avbryt',
                    method: () => {
                        self.modal.getContent().then(() => {
                            self.modal.close();
                            self.canceled.emit(true);
                        });

                        return false;
                    }
                },
                {
                    text: 'Overfør til faktura',
                    class: 'good',
                    method: () => {
                        self.modal.getContent().then((content: OrderToInvoiceModalType) => {
                            self.modalConfig.model.Items = content.form.selectedItems;
                            self.modal.close();
                            self.changed.emit(self.modalConfig.model.Items);
                            return false;
                        });
                    }
                }
            ]
        };
    }

    public openModal(order: CustomerOrder) {
        Observable.forkJoin(
            this.customerOrderService.Get(order.ID, ['Items', 'Items.Product'])
        ).subscribe(
            (data) => {
                // Show only items in state 'Registered'. According to status flow for items
                let itemsInRegisteredState: CustomerOrderItem[] = [];

                for (let i = 0; i < data[0].Items.length; i++) {
                    let line = data[0].Items[i];

                    if (line.StatusCode === StatusCodeCustomerOrderItem.Registered) {
                        itemsInRegisteredState.push(line);
                    }
                }

                data[0].Items = itemsInRegisteredState;

                this.modalConfig.model = data[0];
                this.modal.open();
            },
            (err) => console.log('Error retrieving data: ', err)
            );
    }
}
