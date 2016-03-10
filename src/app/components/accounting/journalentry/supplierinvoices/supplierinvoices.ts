import {Component} from "angular2/core";

import {SupplierInvoice} from "../../../../unientities";

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

    newSupplierInvoiceCreated(SupplierInvoice: SupplierInvoice) {
        //todo
    }
}