import {Component, Input, Output, EventEmitter} from "angular2/core";
import {SupplierInvoice} from "../../../../unientities";

@Component({
    selector: "supplier-invoice-edit",
    templateUrl: "app/components/accounting/journalentry/supplierinvoices/supplierinvoiceedit.html"    
})
export class SupplierInvoiceEdit {
    @Input() SupplierInvoice: SupplierInvoice;
    @Output() Updated = new EventEmitter<SupplierInvoice>();
                
    constructor() {
  
    } 
}