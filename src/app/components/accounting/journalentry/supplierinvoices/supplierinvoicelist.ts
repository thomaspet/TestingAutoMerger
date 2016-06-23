import {Component, ViewChild, OnInit} from '@angular/core';
import {Router} from '@angular/router-deprecated';

import {SupplierInvoiceService, AccountService} from '../../../../services/services';

import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {RegisterPaymentModal} from '../../../common/modals/registerPaymentModal';
import {InvoicePaymentData} from '../../../../models/sales/InvoicePaymentData';
import {InvoiceSummary} from '../../../../models/accounting/InvoiceSummary';


declare const moment;


@Component({
    selector: 'supplier-invoice-list',    
    templateUrl: 'app/components/accounting/journalentry/supplierinvoices/supplierinvoicelist.html',
    providers: [SupplierInvoiceService, AccountService],
    directives: [UniTable, RegisterPaymentModal]
})
export class SupplierInvoiceList implements OnInit {
    private lookupFunction: (urlParams: URLSearchParams) => Observable<any>;

    private DATE_FORMAT: string = 'DD.MM.YYYY';
    private errors;

    @ViewChild(RegisterPaymentModal)
    private registerPaymentModal: RegisterPaymentModal;

    private supplierInvoiceTableCfg: UniTableConfig;
    private summaryData: InvoiceSummary;
    
    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private router: Router
    ) {}
    
    private setError(error) {
        console.log("== ERROR ==", error);
        var messages = error._body ? JSON.parse(error._body) : error;
        if (messages) {
            this.errors = messages.Messages ? messages.Messages : [messages];
            setInterval(() => {
                this.errors = null;
            }, 5000);            
        }
    }

    public ngOnInit() {
        this.supplierInvoiceTableCfg = this.setupTableCfg();
        this.lookupFunction = (urlParams: URLSearchParams) => {
            urlParams = urlParams || new URLSearchParams();
            urlParams.set('expand', 'JournalEntry,Supplier.Info');
            return this.supplierInvoiceService.GetAllByUrlSearchParams(urlParams);
        };
        
        this.onFiltersChange('');
    }

    public onLineClick(selectedItem) {
        this.router.navigateByUrl('/accounting/journalentry/supplierinvoices/details/' + selectedItem.ID);
    }

    public createInvoice() {
        this.router.navigateByUrl('/accounting/journalentry/supplierinvoices/details/0');
    }

    public onRegisteredPayment(modalData: any) {
        this.supplierInvoiceService
            .payinvoice(modalData.id, modalData.invoice)
            .subscribe(() => alert('Invoice payment registered successfully'), (error) => {
                this.setError(error);
            });
    }

    private setupTableCfg(): UniTableConfig {
        const statusTextCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number)
            .setTemplate((dataItem) => {
                return this.supplierInvoiceService.getStatusText(dataItem.StatusCode);
            });

        const journalEntryCol = new UniTableColumn('JournalEntry.JournalEntryNumber', 'Bilagsnr', UniTableColumnType.Number)
            .setFilterOperator('startswith')
            .setTemplate(journalEntry => {
                if (journalEntry.JournalEntry && journalEntry.JournalEntry.JournalEntryNumber) {
                    return `<a href="#/accounting/transquery/detailsByJournalEntryNumber/${journalEntry.JournalEntry.JournalEntryNumber}">
                                ${journalEntry.JournalEntry.JournalEntryNumber}
                            </a>`;
                }
            });

        const supplierNrCol = new UniTableColumn('Supplier.SupplierNumber', 'Lev.nr', UniTableColumnType.Number).setFilterOperator('startswith');

        const supplierNameCol = new UniTableColumn('Supplier.Info.Name', 'Navn', UniTableColumnType.Text).setFilterOperator('contains');

        const invoiceDateCol = new UniTableColumn('InvoiceDate', 'Fakturadato', UniTableColumnType.Date)
            .setFilterOperator('eq')            
            .setFormat(this.DATE_FORMAT);

        const invoiceIDCol = new UniTableColumn('InvoiceNumber', 'Fakturanr', UniTableColumnType.Number).setFilterOperator('startswith');

        const bankAccount = new UniTableColumn('BankAccount', 'Bankkontonr', UniTableColumnType.Text).setFilterOperator('contains');

        const paymentDueDateCol = new UniTableColumn('PaymentDueDate', 'Forfallsdato', UniTableColumnType.Date)
            .setFilterOperator('eq')            
            .setConditionalCls(journalEntry =>
                moment(journalEntry.PaymentDueDate).isBefore(moment()) ? 'supplier-invoice-table-payment-overdue' : ''
            )
            .setFormat(this.DATE_FORMAT);

        const paymentIdOrName = new UniTableColumn('PaymentID' /*not important,overridden by template*/, 'KID / Melding')
            .setFilterOperator('contains')
            .setTemplate((journalEntry) => journalEntry.PaymentInformation || journalEntry.PaymentID);

        const taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Beløp')
            .setFilterOperator('eq')
            .setCls('supplier-invoice-table-amount'); // TODO decide what/how format is set for the different field types

        const restAmountCol = new UniTableColumn('RestAmount', 'Restbeløp', UniTableColumnType.Number)
            .setFilterOperator('eq')            
            .setCls('column-align-right')
            .setFormat('{0:n}');

        const creditedAmountCol = new UniTableColumn('CreditedAmount', 'Kreditert', UniTableColumnType.Number)
            .setFilterOperator('eq')            
            .setCls('column-align-right')
            .setFormat('{0:n}');

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
                taxInclusiveAmountCol,
                restAmountCol,
                creditedAmountCol
            ])
            .setPageSize(15)
            .setSearchable(true)            
            .setContextMenu([
                {
                    label: 'Rediger',
                    action: supplierInvoice => this.router.navigateByUrl(`/accounting/journalentry/supplierinvoices/details/${supplierInvoice.ID}`)
                },
                {
                    label: 'Tildel',
                    action: supplierInvoice => this.supplierInvoiceService.assign(supplierInvoice.ID)
                        .subscribe(() => alert('Successful'), error => alert(`An error occurred: ${error}`)),
                    disabled: supplierInvoice => !supplierInvoice._links.actions.assign
                },
                {
                    label: 'Bokfør',
                    action: supplierInvoice => this.supplierInvoiceService.journal(supplierInvoice.ID)
                        .subscribe(() => alert('Successful'), error => alert(`An error occurred: ${error}`)),
                    disabled: supplierInvoice => !supplierInvoice._links.actions.journal
                },
                {
                    label: 'Registere betaling',
                    action: supplierInvoice => {
                        const title = `Register betaling${supplierInvoice.InvoiceNumber ? ', Faktura ' + supplierInvoice.InvoiceNumber : ''}${supplierInvoice.InvoiceRecieverName ? ', ' + supplierInvoice.InvoiceRecieverName : ''}`;
                        const invoiceData: InvoicePaymentData = {
                            Amount: supplierInvoice.TaxInclusiveAmount,
                            PaymentDate: new Date()
                        };
                        this.registerPaymentModal.openModal(supplierInvoice.SupplierID, title, invoiceData);
                    },
                    disabled: supplierInvoice => !supplierInvoice._links.actions.payInvoice
                },
                {
                    label: 'Send til betaling',
                    action: supplierInvoice => this.supplierInvoiceService.sendForPayment(supplierInvoice.ID)
                        .subscribe(() => alert('Successful'), error => alert(`An error occurred: ${error}`)),
                    disabled: supplierInvoice => !supplierInvoice._links.actions.sendForPayment
                },
                {
                    label: 'Slett',
                    action: supplierInvoice => this.supplierInvoiceService.Remove(supplierInvoice.ID, supplierInvoice)
                        .subscribe(() => alert('Successful'), error => alert(`An error occurred: ${error}`)),
                    disabled: supplierInvoice => !supplierInvoice._links.actions.delete
                }
            ]);
    }
    
    public onFiltersChange(filter: string) {
        this.supplierInvoiceService
            .getInvoiceSummary(filter)
            .subscribe((summary) => {
                this.summaryData = summary;
            },
            (err) => { 
                console.log('Error retrieving summarydata:', err);
                this.summaryData = null;
            });
    }
}
