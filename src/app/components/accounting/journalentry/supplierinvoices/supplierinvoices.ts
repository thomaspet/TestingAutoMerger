import {Component} from '@angular/core';
import {Router } from '@angular/router-deprecated';

import {SupplierInvoice} from '../../../../unientities';

import {JournalEntryManual} from '../journalentrymanual/journalentrymanual';
import {SupplierInvoiceList} from './supplierinvoicelist';
import {SupplierInvoiceDetail} from './supplierinvoicedetail';

@Component({
    selector: 'supplier-invoices',
    templateUrl: 'app/components/accounting/journalentry/supplierinvoices/supplierinvoices.html',
    directives: [SupplierInvoiceList, SupplierInvoiceDetail, JournalEntryManual]
})

export class SupplierInvoices {
    private selectedSupplierInvoice: SupplierInvoice;

    constructor(private _router: Router) {
    }

    private invoiceSelected(input) {
        this.selectedSupplierInvoice = input;
    }
}
