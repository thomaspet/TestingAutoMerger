import {Component, Input, Output, EventEmitter} from "angular2/core";
import {SupplierInvoice} from "../../../../unientities";

@Component({
    selector: "supplier-invoice-add",
    templateUrl: "app/components/accounting/journalentry/supplierinvoices/supplierinvoiceadd.html"    
})
export class SupplierInvoiceAdd {
    @Input() SupplierInvoice: SupplierInvoice;
    @Output() Created = new EventEmitter<SupplierInvoice>();
                
    constructor() {
  
    }
}