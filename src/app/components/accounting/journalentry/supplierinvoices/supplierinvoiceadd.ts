import {Component, ViewChild, SimpleChange, Input, Output, EventEmitter} from "angular2/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {FieldType, ISupplier, ISupplierInvoice, ISupplierInvoiceItem} from "../../../../interfaces";
import {SupplierInvoiceService, SupplierService} from "../../../../services/services";

import {UNI_CONTROL_DIRECTIVES} from "../../../../../../src/framework/controls";
import {UniForm, UniFormBuilder, UniFieldsetBuilder, UniFieldBuilder} from "../../../../../framework/forms";

@Component({
    selector: "supplier-invoice-add",
    templateUrl: "app/components/accounting/journalentry/supplierinvoices/supplierinvoiceadd.html"    
})
export class SupplierInvoiceAdd {
    @Input() SupplierInvoice: ISupplierInvoice;
    @Output() Created = new EventEmitter<ISupplierInvoice>();
                
    constructor() {
  
    }
}