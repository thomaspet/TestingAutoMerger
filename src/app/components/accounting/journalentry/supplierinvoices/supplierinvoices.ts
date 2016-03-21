import {Component} from "angular2/core";
import {Router } from 'angular2/router';

import {SupplierInvoice} from "../../../../unientities";

import {JournalEntryManual} from '../journalentrymanual/journalentrymanual';
import {SupplierInvoiceList} from './supplierinvoicelist';
import {SupplierInvoiceDetail} from './supplierinvoicedetail';

import {UniFieldsetBuilder, UniFieldBuilder, UniSectionBuilder} from "../../../../../framework/forms";

@Component({
    selector: "supplier-invoices",
    templateUrl: "app/components/accounting/journalentry/supplierinvoices/supplierinvoices.html",
    directives: [SupplierInvoiceList, SupplierInvoiceDetail, JournalEntryManual]
})

export class SupplierInvoices {
    private selectedSupplierInvoice: SupplierInvoice;

    constructor(private _router: Router) {
    }

    ngInit() {

    }

    onAddNew()
    {
        this._router.navigateByUrl("/journalentry/supplierinvoices/New");
    }

    todo(input)
    {
        this.selectedSupplierInvoice = input;
    }
}