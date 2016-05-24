import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router-deprecated';

import {SupplierInvoiceService,  AccountService} from '../../../../services/services';

import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';

declare const moment;

@Component({
    selector: 'supplier-invoice-list',    
    templateUrl: 'app/components/accounting/journalentry/supplierinvoices/supplierinvoicelist.html',
    providers: [SupplierInvoiceService, AccountService],
    directives: [UniTable]
})
export class SupplierInvoiceList implements OnInit {
    private lookupFunction: (urlParams: URLSearchParams) => Observable<any>;

    private supplierInvoiceTableCfg: UniTableConfig;

    private DATE_FORMAT: string = 'DD.MM.YYYY';

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private router: Router
    ) {}

    public ngOnInit() {
        this.supplierInvoiceTableCfg = this.setupTableCfg();
        this.lookupFunction = (urlParams: URLSearchParams) => {
            urlParams = urlParams || new URLSearchParams();
            urlParams.set('expand', 'JournalEntry,Supplier.Info');
            return this.supplierInvoiceService.GetAllByUrlSearchParams(urlParams);
        };
    }

    public onLineClick(selectedItem) {
        this.router.navigateByUrl('/accounting/journalentry/supplierinvoices/details/' + selectedItem.ID);
    }

    public createInvoice() {
        this.router.navigateByUrl('/accounting/journalentry/supplierinvoices/details/0');
    }

    private setupTableCfg(): UniTableConfig {
        const statusTextCol = new UniTableColumn('StatusCode', 'Status')
            .setTemplate((dataItem) => {
                return this.supplierInvoiceService.getStatusText(dataItem.StatusCode);
            });

        const journalEntryCol = new UniTableColumn('JournalEntry.JournalEntryNumber', 'Bilagsnr')
            .setTemplate(journalEntry => {
                if (journalEntry.JournalEntry && journalEntry.JournalEntry.JournalEntryNumber) {
                    return `<a href="#/accounting/transquery/detailsByJournalEntryNumber/${journalEntry.JournalEntry.JournalEntryNumber}">
                                ${journalEntry.JournalEntry.JournalEntryNumber}
                            </a>`;
                }
            });

        const supplierNrCol = new UniTableColumn('Supplier.SupplierNumber', 'Lev.nr');

        const supplierNameCol = new UniTableColumn('Supplier.Info.Name', 'Navn');

        const invoiceIDCol = new UniTableColumn('InvoiceNumber', 'Fakturanr');

        const bankAccount = new UniTableColumn('BankAccount', 'Bankkontonr');

        const invoiceDateCol = new UniTableColumn('InvoiceDate', 'Fakturadato')
            .setType(UniTableColumnType.Date)
            .setFormat(this.DATE_FORMAT);

        const paymentDueDateCol = new UniTableColumn('PaymentDueDate', 'Forfallsdato')
            .setType(UniTableColumnType.Date)
            .setConditionalCls(journalEntry =>
                moment(journalEntry.PaymentDueDate).isBefore(moment()) ? 'supplier-invoice-table-payment-overdue' : ''
            )
            .setFormat(this.DATE_FORMAT);

        const paymentIdOrName = new UniTableColumn('ID' /*not important,overridden by template*/, 'KID / Melding')
            .setTemplate((journalEntry) => journalEntry.PaymentInformation || journalEntry.PaymentID);

        const taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Beløp')
            .setCls('supplier-invoice-table-amount'); // TODO decide what/how format is set for the different field types

        return new UniTableConfig(false, true)
            .setColumns([
                statusTextCol,
                journalEntryCol,
                supplierNrCol,
                supplierNameCol,
                invoiceDateCol,
                paymentDueDateCol,
                invoiceIDCol,
                bankAccount,
                paymentIdOrName,
                taxInclusiveAmountCol
            ])
            .setPageSize(15);
    }
}
