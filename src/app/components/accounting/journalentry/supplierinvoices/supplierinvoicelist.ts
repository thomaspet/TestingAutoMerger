import {Component, ViewChild, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {RegisterPaymentModal} from '../../../common/modals/registerPaymentModal';
import {InvoicePaymentData} from '../../../../models/sales/InvoicePaymentData';
import {InvoiceSummary} from '../../../../models/accounting/InvoiceSummary';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {SupplierInvoice, StatusCodeSupplierInvoice} from '../../../../unientities';
import {JournalEntryManual} from '../journalentrymanual/journalentrymanual';
import {
    ErrorService,
    SupplierInvoiceService,
    JournalEntryService
} from '../../../../services/services';

declare const moment;

@Component({
    selector: 'supplier-invoice-list',
    templateUrl: 'app/components/accounting/journalentry/supplierinvoices/supplierinvoicelist.html'
})
export class SupplierInvoiceList implements OnInit {
    private lookupFunction: (urlParams: URLSearchParams) => Observable<any>;

    private DATE_FORMAT: string = 'DD.MM.YYYY';
    private errors;

    @ViewChild(RegisterPaymentModal) private registerPaymentModal: RegisterPaymentModal;

    private supplierInvoiceTableCfg: UniTableConfig;
    private summaryData: InvoiceSummary;

    @ViewChild(UniTable) private table: UniTable;
    @ViewChild(JournalEntryManual) private journalEntryManual: JournalEntryManual;

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private router: Router,
        private tabService: TabService,
        private journalEntryService: JournalEntryService,
        private errorService: ErrorService
    ) {
        this.tabService.addTab({ name: 'Leverandørfaktura', url: '/accounting/journalentry/supplierinvoices', moduleID: UniModules.Accounting, active: true });
    }

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
            urlParams.set('expand', 'JournalEntry,Supplier.Info,Dimensions.Department,Dimensions.Project');
            return this.supplierInvoiceService.GetAllByUrlSearchParams(urlParams)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        this.onFiltersChange('');
    }

    public onLineClick(selectedItem) {
        this.router.navigateByUrl('/accounting/journalentry/supplierinvoices/' + selectedItem.ID);
    }

    public createInvoice() {
        this.supplierInvoiceService.newSupplierInvoice().then(invoice => {
            this.supplierInvoiceService.Post(invoice)
                .subscribe(
                (supplierinvoice) => {
                    this.router.navigateByUrl('/accounting/journalentry/supplierinvoices/' + supplierinvoice.ID);
                },
                    err => this.errorService.handle(err)
                );
        });
    }

    private registerPayment(supplierInvoice: SupplierInvoice) {
        const title = `Register betaling${supplierInvoice.InvoiceNumber ? ', Faktura ' + supplierInvoice.InvoiceNumber : ''}${supplierInvoice.InvoiceReceiverName ? ', ' + supplierInvoice.InvoiceReceiverName : ''}`;
        const invoiceData: InvoicePaymentData = {
            Amount: supplierInvoice.RestAmount,
            PaymentDate: new Date()
        };
        this.registerPaymentModal.openModal(supplierInvoice.ID, title, invoiceData);
    }

    public onRegisteredPayment(modalData: any) {

        this.supplierInvoiceService.ActionWithBody(modalData.id, modalData.invoice, 'payInvoice').subscribe((journalEntry) => {
            this.table.refreshTableData();

        }, err => this.errorService.handle(err));
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

        const invoiceDateCol = new UniTableColumn('InvoiceDate', 'Fakturadato', UniTableColumnType.LocalDate)
            .setFilterOperator('eq')
            .setFormat(this.DATE_FORMAT);

        const invoiceIDCol = new UniTableColumn('InvoiceNumber', 'Fakturanr', UniTableColumnType.Number).setFilterOperator('startswith');

        const bankAccount = new UniTableColumn('BankAccount', 'Bankkontonr', UniTableColumnType.Text).setFilterOperator('contains');

        const paymentDueDateCol = new UniTableColumn('PaymentDueDate', 'Forfallsdato', UniTableColumnType.LocalDate)
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

        let departmentCol = new UniTableColumn('Dimensions.Department.DepartmentNumber', 'Avdeling', UniTableColumnType.Text).setWidth('15%').setFilterOperator('contains')
            .setTemplate((data: SupplierInvoice) => {return data.Dimensions && data.Dimensions.Department ? data.Dimensions.Department.DepartmentNumber + ': ' + data.Dimensions.Department.Name : ''; });
        let projectCol = new UniTableColumn('Dimensions.Project.ProjectNumber', 'Prosjekt', UniTableColumnType.Text).setWidth('15%').setFilterOperator('contains')
            .setTemplate((data: SupplierInvoice) => {return data.Dimensions && data.Dimensions.Project ? data.Dimensions.Project.ProjectNumber + ': ' + data.Dimensions.Project.Name : ''; });


        //TODO: Skal denne vises?
        //const creditedAmountCol = new UniTableColumn('CreditedAmount', 'Kreditert', UniTableColumnType.Number)
        //    .setFilterOperator('eq')
        //    .setCls('column-align-right')
        //    .setFormat('{0:n}');

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
                departmentCol,
                projectCol
            ])
            .setPageSize(15)
            .setSearchable(true)
            .setContextMenu([
                {
                    label: 'Rediger',
                    action: supplierInvoice => this.router.navigateByUrl(`/accounting/journalentry/supplierinvoices/${supplierInvoice.ID}`)
                },
                {
                    label: 'Bokfør',
                    action: supplierInvoice => {
                        //save and run transition to booking
                        let journalEntryData = this.journalEntryManual.getJournalEntryData();

                        // set date today if date is default value / empty
                        journalEntryData.forEach((line) => {
                            if (line.FinancialDate.toISOString() == '0001-01-01T00:00:00.000Z') {
                                line.FinancialDate = new Date();
                            }
                        });

                        this.journalEntryService
                            .saveJournalEntryData(journalEntryData)
                            .subscribe((res) => {
                                this.supplierInvoiceService.Put(supplierInvoice.ID, supplierInvoice)
                                    .subscribe((res) => {
                                        let sum = journalEntryData.map((line) => line.Amount).reduce((a, b) => {
                                            return (a > 0 ? a : 0) + (b > 0 ? b : 0)
                                        });
                                        if (sum != supplierInvoice.TaxInclusiveAmount) {
                                            this.setError({ Message: 'Sum bilagsbeløp er ulik leverandørfakturabeløp' });
                                        } else {
                                            this.supplierInvoiceService.Transition(supplierInvoice.ID, supplierInvoice, 'journal')
                                                .subscribe((res) => {
                                                    this.table.refreshTableData();
                                                },
                                                (error) => {
                                                    this.setError(error);
                                                }
                                                );
                                        }
                                    },
                                        err => this.errorService.handle(err)
                                    )
                            },
                                err => this.errorService.handle(err)
                            );

                    },
                    disabled: (supplierInvoice) => {
                        return true; //TODO. Bokføring feiler nå!!
                        //if (supplierInvoice.StatusCode === StatusCodeSupplierInvoice.Draft) {
                        //    return false;
                        //}
                        //return true;
                    }
                },
                {
                    label: 'Registere betaling',
                    action: supplierInvoice => {
                        if (supplierInvoice.StatusCode === StatusCodeSupplierInvoice.Journaled) {
                            this.supplierInvoiceService.Transition(supplierInvoice.ID, supplierInvoice, 'sendForPayment').subscribe(() => {
                                console.log('== TRANSITION OK sendForPayment ==');
                                this.registerPayment(supplierInvoice)
                            },
                                err => this.errorService.handle(err)
                            );
                        }
                        else {
                            this.registerPayment(supplierInvoice);
                        }
                    },
                    //disabled: supplierInvoice => !supplierInvoice._links.actions.payInvoice
                    disabled: (supplierInvoice) => {
                        if (supplierInvoice.StatusCode === StatusCodeSupplierInvoice.Journaled ||
                            supplierInvoice.StatusCode === StatusCodeSupplierInvoice.ToPayment ||
                            supplierInvoice.StatusCode === StatusCodeSupplierInvoice.PartlyPayed) {
                            return false;
                        }
                        return true;
                    }
                },
                {
                    label: 'Slett',
                    action: supplierInvoice => this.supplierInvoiceService.Remove(supplierInvoice.ID, supplierInvoice)
                        .subscribe(() => alert('Successful'), err => this.errorService.handle(err)),
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
                this.errorService.handle(err);
                this.summaryData = null;
            });
    }
}
