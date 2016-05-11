import {Component} from '@angular/core';

import {SupplierInvoice} from '../../../../unientities';
import {SupplierInvoiceList} from './supplierinvoicelist';
import {SupplierInvoiceDetail} from './supplierinvoicedetail';

@Component({
    selector: 'supplier-invoices',
    templateUrl: 'app/components/accounting/journalentry/supplierinvoices/supplierinvoices.html',
    directives: [SupplierInvoiceList, SupplierInvoiceDetail]
})

export class SupplierInvoices {
    private selectedSupplierInvoice: SupplierInvoice;

    constructor() {
    }

    private invoiceSelected(input) {
        this.selectedSupplierInvoice = input;
    }
}
