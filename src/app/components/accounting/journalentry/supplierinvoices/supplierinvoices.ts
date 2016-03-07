import {Component, SimpleChange, Input, Output, EventEmitter} from "angular2/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {FieldType, ISupplier, ISupplierInvoice, ISupplierInvoiceItem} from "../../../../interfaces";
import {JournalEntryService, JournalEntryLineService, SupplierInvoiceService, SupplierService} from "../../../../services/services";

import {JournalEntryManual} from '../journalentrymanual/journalentrymanual';
import {SupplierInvoiceList} from './supplierinvoicelist';
import {SupplierInvoiceAdd} from './supplierinvoiceadd';

@Component({ 
    selector: "supplier-invoices",
    templateUrl: "app/components/accounting/journalentry/supplierinvoices/supplierinvoices.html",
    directives: [SupplierInvoiceList, SupplierInvoiceAdd, JournalEntryManual]    
})
export class SupplierInvoices {        
    constructor() {
        //TODO: Sett opp knapper for å lage ny faktura etc + events for å oppdatere tabell 
    }
    
    ngInit() {
        
    }
    
    newSupplierInvoiceCreated(SupplierInvoice : ISupplierInvoice) {
        //todo
    }
}