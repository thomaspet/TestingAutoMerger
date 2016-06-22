import {Component, ViewChildren, Type, Input, Output, QueryList, ViewChild, ComponentRef, EventEmitter, SimpleChange} from "@angular/core";
import {NgIf, NgModel, NgFor, NgClass} from "@angular/common";

import {UniModal} from "../../../../../framework/modals/modal";

import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from 'unitable-ng2/main';
import {UniForm, UniFieldLayout} from '../../../../../framework/uniform';

import {FieldType, ComponentLayout, Address} from "../../../../unientities";
import {CustomerOrder, CustomerOrderItem, Product, VatType} from '../../../../unientities';

@Component({
    selector: 'order-to-invoice-table',
    directives: [UniTable, NgIf],
    template: `
    <span *ngIf="order && orderItemTable">
        <uni-table [resource]="items"
               [config]="orderItemTable"
               (rowChanged)="rowChanged($event)">
        </uni-table>
    </span>
    `
})
export class OrderToInvoiceTable {
    @ViewChild(UniTable) public table: UniTable;
    @Input() public order: CustomerOrder;

    private orderItemTable: UniTableConfig;

    public ngOnInit() {
        console.log('OrderToInvoiceTable.ngOnInit()');
        this.setupUniTable();
    }

    private setupUniTable() {
        let productNrCol = new UniTableColumn('Product', 'Produktnr', UniTableColumnType.Text)
            .setDisplayField('Product.PartName');
        let productNameCol = new UniTableColumn('Product', 'Produktnavn', UniTableColumnType.Text)
            .setDisplayField('Product.Name');
        let numItemsCol = new UniTableColumn('NumberOfItems', 'Antall', UniTableColumnType.Number);

        // Setup table        
        this.orderItemTable = new UniTableConfig()
            .setColumns([
                productNrCol, productNameCol, numItemsCol
            ])
            .setMultiRowSelect(true);
    }
}

// order-to-invoice modal type
@Component({
    selector: "order-to-invoice-modal-type",
    directives: [NgIf, NgModel, NgFor, NgClass],
    template: `
        <article class="modal-content address-modal">
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
    @Input('config') public config;
    @ViewChild(OrderToInvoiceTable) public form: OrderToInvoiceTable;

    public ngOnInit() {
        console.log('OrderToInvoiceModalType.ngOnInit()');
    }
}

// order to invoice modal
@Component({
    selector: "order-to-invoice-modal",
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `,
    directives: [UniModal]
})
export class OrderToInvoiceModal {
    @Input() public order: CustomerOrder;
    @ViewChild(UniModal) public modal: UniModal;

    @Output() public Changed = new EventEmitter<CustomerOrderItem[]>();
    @Output() public Canceled = new EventEmitter<boolean>();

    private modalConfig: any = {};
    private type: Type = OrderToInvoiceModalType;

    constructor() {
        var self = this;
        this.modalConfig = {
            title: "",
            mode: null,

            actions: [
                {
                    text: "Avbryt",
                    method: () => {
                        self.modal.getContent().then(() => {
                            self.modal.close();
                            self.Canceled.emit(true);
                        });

                        return false;
                    }
                },
                {
                    text: "Overføre til faktura",
                    class: "good",
                    method: () => {
                        self.modal.close();
                        self.Changed.emit(this.modalConfig.model.Items);
                        return false;
                    }
                },
                {
                    text: "Overføre første linje",
                    class: "good",
                    method: () => {
                        self.modal.close();
                        self.Changed.emit(this.modalConfig.model.Items[0]);
                        return false;
                    }
                }
            ]
        };
    }

    public openModal(order: CustomerOrder) {
        this.modalConfig.model = order;
        this.modal.open();

    }
}