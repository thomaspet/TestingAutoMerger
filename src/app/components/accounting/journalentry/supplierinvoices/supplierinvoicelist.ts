import {Component, SimpleChange, Input, Output, EventEmitter} from "angular2/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {FieldType, ISupplier, ISupplierInvoice, ISupplierInvoiceItem} from "../../../../../framework/interfaces/interfaces";
import {JournalEntryService, JournalEntryLineService, SupplierInvoiceService, SupplierService} from "../../../../services/services";

import {TabService} from "../../../layout/navbar/tabstrip/tabService";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../../src/framework/controls";
import {UniForm, UniFormBuilder, UniFieldsetBuilder, UniFieldBuilder} from "../../../../../framework/forms";
import {UniTabs} from '../../../layout/uniTabs/uniTabs';

import {SupplierInvoiceEdit} from './supplierinvoiceedit';

@Component({
    selector: "supplier-invoice-list",
    templateUrl: "app/components/accounting/journalentry/supplierinvoices/supplierinvoicelist.html",
    directives: [SupplierInvoiceEdit]    
})
export class SupplierInvoiceList {    
    constructor() {
  
    }
    
    ngInit() {
        //TODO: Sett opp unitable++
    }
    
    supplierInvoiceUpdated(supplierInvoice : ISupplierInvoice) {
        //todo
    }
}