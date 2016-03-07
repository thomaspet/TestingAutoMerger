import {Component, ViewChild, SimpleChange, Input, Output, EventEmitter} from "angular2/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {FieldType, ISupplier, ISupplierInvoice, ISupplierInvoiceItem} from "../../../../interfaces";
import {SupplierInvoiceService, SupplierService} from "../../../../services/services";

import {UNI_CONTROL_DIRECTIVES} from "../../../../../../src/framework/controls";
import {UniForm, UniFormBuilder, UniFieldsetBuilder, UniFieldBuilder} from "../../../../../framework/forms";

@Component({
    selector: "supplier-invoice-edit",
    templateUrl: "app/components/accounting/journalentry/supplierinvoices/supplierinvoiceedit.html"    
})
export class SupplierInvoiceEdit {
    @Input() SupplierInvoice: ISupplierInvoice;
    @Output() Updated = new EventEmitter<ISupplierInvoice>();
                
    constructor() {
  
    } 
}