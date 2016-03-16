import {Component} from "angular2/core";
//import {Router, RouteParams, RouteConfig, ROUTER_DIRECTIVES } from 'angular2/router';
import {Router } from 'angular2/router';

import {SupplierInvoice} from "../../../../unientities";

import {JournalEntryManual} from '../journalentrymanual/journalentrymanual';
import {SupplierInvoiceList} from './supplierinvoicelist';
import {SupplierInvoiceAdd} from './supplierinvoiceadd';
import {SupplierInvoiceEdit} from './supplierinvoiceedit';
import {SupplierInvoiceDetail} from './supplierinvoicedetail';

import {UniFieldsetBuilder, UniFieldBuilder, UniSectionBuilder} from "../../../../../framework/forms";

@Component({
    selector: "supplier-invoices",
    templateUrl: "app/components/accounting/journalentry/supplierinvoices/supplierinvoices.html",
    directives: [SupplierInvoiceList, SupplierInvoiceAdd, SupplierInvoiceEdit, SupplierInvoiceDetail, JournalEntryManual]
})

    //@RouteConfig([
    //    { path: '/', redirectTo: ['Supplierinvoices'] },
    //    { path: '/Supplierinvoices', name: 'Supplierinvoices', component: SupplierInvoiceList, useAsDefault: true },
    //    { path: '/Supplierinvoiceedit/:id', name: 'SupplierinvoiceEdit', component: SupplierInvoiceEdit },
    //    { path: '/Supplierinvoiceadd/:id', name: 'SupplierinvoiceAdd', component: SupplierInvoiceAdd }
//])

export class SupplierInvoices {
    private selectedSupplierInvoice: SupplierInvoice;

    constructor(private _router: Router) {
        //TODO: Sett opp knapper for å lage ny faktura etc + events for å oppdatere tabell 
    }

    ngInit() {

    }

    newSupplierInvoiceCreated(SupplierInvoice: SupplierInvoice) {
        //todo
    }

    onAddNew()
    {
        console.log("onAddNew");
        this._router.navigateByUrl("/journalentry/supplierinvoices/New");
    }
    openSupplierInvoiceAddDialog() {
        console.log("openSupplierInvoiceAddDialog");
    }

    todo(input)
    {
        this.selectedSupplierInvoice = input;
    }
}