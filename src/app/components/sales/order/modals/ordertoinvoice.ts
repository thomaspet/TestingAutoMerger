import {Component, ViewChildren, Type, Input, Output, QueryList, ViewChild, ComponentRef, EventEmitter, SimpleChange} from "@angular/core";
import {NgIf, NgModel, NgFor, NgClass} from "@angular/common";
import {UniModal} from "../../../../../framework/modals/modal";
import {UniComponentLoader} from "../../../../../framework/core/componentLoader";
import {UniFormBuilder} from "../../../../../framework/forms/builders/uniFormBuilder";
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";
import {UniFieldBuilder} from "../../../../../framework/forms/builders/uniFieldBuilder";
import {FieldType, ComponentLayout, Address} from "../../../../unientities";
import {UniFormLayoutBuilder} from "../../../../../framework/forms/builders/uniFormLayoutBuilder";
import {AddressService} from "../../../../services/services";
import {CustomerOrder, CustomerOrderItem, Product, VatType} from '../../../../unientities';

@Component({
    selector: 'order-to-invoice-table',
    directives: [UniTable,NgIf],
    template: `
       <uni-table *ngIf="order" [config]="orderItemTable"></uni-table>
    `
})
export class OrderToInvoiceTable {
    @ViewChild(UniTable) table: UniTable;
    orderItemTable: UniTableBuilder;
    order: CustomerOrder; 
           
    setupUniTable(order: CustomerOrder) {
        this.order = order;
        
        // Define columns to use in the table
        var selCol = new UniTableColumn('X', '', 'bool')
            //.setCustomEditor('checkbox', (item, row) => {
            //   console.log("=== CHECKBOX SELECTED=="); 
            //});
            .setTemplate("<input type=\"checkbox\" checked=\"checked\" id=\"test\"></input><label for=\"test\"></label>")
            .setEditable(false);
        var partnameCol = new UniTableColumn('Product', 'Produktnr', 'string')
                            .setTemplate('# if (ProductID) {# <span> #=Product$PartName #</span> #}#').setWidth('20%');
        var nameCol = new UniTableColumn('Product.Name', 'Produktnavn', 'string');
        var noOfItemsCol = new UniTableColumn('NumberOfItems', 'Antall', 'number').setShowOnSmallScreen(false).setWidth('15%');
        
        // Setup table        
        this.orderItemTable = new UniTableBuilder(this.order.Items, false)            
            .setFilterable(false)
            .setSearchable(false)            
            .setPageable(false)
            .setColumnMenuVisible(false)
            .setToolbarOptions(null)
     //       .setChangeCallback((e, rowModel) => this.handleDataSourceChanges(e, rowModel))            
            .addColumns(selCol, partnameCol, nameCol, noOfItemsCol);      
    }

}

// address modal type
@Component({
    selector: "order-to-invoice-modal-type",
    directives: [NgIf, NgModel, NgFor, NgClass, UniComponentLoader],
    template: `
        <article class="modal-content address-modal">
            <h1 *ngIf="config.title">{{config.title}}</h1>
            <uni-component-loader></uni-component-loader>
            <footer>
                <button *ngFor="#action of config.actions; #i=index" (click)="action.method()" [ngClass]="action.class">
                    {{action.text}}
                </button>
            </footer>
        </article>
    `
})
export class OrderToInvoiceModalType {
    @Input('config')
    config;
    @ViewChild(UniComponentLoader)
    ucl: UniComponentLoader;
    instance: Promise<OrderToInvoiceTable>;
    
    ngAfterViewInit() {
        var self = this;
        this.ucl.load(OrderToInvoiceTable).then((cmp: ComponentRef<any>)=> {
            cmp.instance.order = self.config.model;
            self.instance = new Promise((resolve)=> {
                resolve(cmp.instance);
            });
        });
    }
}

// order to invoice modal
@Component({
    selector: "order-to-invoice-modal",
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `,
    directives: [UniModal],
    providers: [AddressService]
})
export class OrderToInvoiceModal {
    @ViewChild(UniModal)
    modal: UniModal;
    
    @Output() Changed = new EventEmitter<CustomerOrderItem[]>();
    @Output() Canceled = new EventEmitter<boolean>();

    modalConfig: any = {};
    type: Type = OrderToInvoiceModalType;
         
    constructor(private addressService: AddressService) {
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
                        self.modal.getContent().then((content: OrderToInvoiceModalType)=> {
                            content.instance.then((table: OrderToInvoiceTable)=> {
                                self.modal.close();   
                                self.Changed.emit(table.order.Items);
                           });
                        });
                        
                        return false;
                    }
                },                               {
                    text: "Overføre første linje",
                    class: "good",
                    method: () => {
                        self.modal.getContent().then((content: OrderToInvoiceModalType)=> {
                            content.instance.then((table: OrderToInvoiceTable)=> {
                                self.modal.close();   
                                self.Changed.emit([table.order.Items[0]]);
                           });
                        });
                        
                        return false;
                    }
                }

            ]
        };
    }
       
    openModal(order: CustomerOrder) {
        var self = this;
        this.modal.getContent().then((content: OrderToInvoiceModalType)=> {
           content.instance.then((table: OrderToInvoiceTable)=> {
                table.setupUniTable(order);
                self.modal.open();             
           });
        });
    }
}