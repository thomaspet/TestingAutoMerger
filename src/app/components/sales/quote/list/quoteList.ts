import { IToolbarConfig } from './../../../common/toolbar/toolbar';
import {Component, ViewChild} from '@angular/core';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from 'unitable-ng2/main';
import {Router} from '@angular/router';
import {URLSearchParams} from '@angular/http';

import {CustomerQuoteService, ReportDefinitionService} from '../../../../services/services';
import {CustomerQuote} from '../../../../unientities';

import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {SendEmailModal} from '../../../common/modals/sendEmailModal';
import {SendEmail} from '../../../../models/sendEmail';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {ErrorService} from '../../../../services/common/ErrorService';

@Component({
    selector: 'quote-list',
    templateUrl: 'app/components/sales/quote/list/quoteList.html'
})
export class QuoteList {
    @ViewChild(PreviewModal) private previewModal: PreviewModal;
    @ViewChild(UniTable) public table: UniTable;
    @ViewChild(SendEmailModal) private sendEmailModal: SendEmailModal;

    private quoteTable: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;

    private toolbarconfig: IToolbarConfig = {
        title: 'Tilbud',
        omitFinalCrumb: true
    };

    constructor(
        private router: Router,
        private customerQuoteService: CustomerQuoteService,
        private reportDefinitionService: ReportDefinitionService,
        private tabService: TabService,
        private toastService: ToastService,
        private errorService: ErrorService
    ) {

        this.tabService.addTab({ name: 'Tilbud', url: '/sales/quotes', active: true, moduleID: UniModules.Quotes });
        this.setupQuoteTable();
    }

    public createQuote() {
        this.router.navigateByUrl('/sales/quotes/0');
    }

    private setupQuoteTable() {

        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams || new URLSearchParams();
            urlParams.set('expand', 'Customer');

            if (!params.has('orderby')) {
                params.set('orderby', 'QuoteDate desc');
            }

            return this.customerQuoteService.GetAllByUrlSearchParams(params)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        // Context menu
        let contextMenuItems: IContextMenuItem[] = [];
        contextMenuItems.push({
            label: 'Rediger',
            action: (quote: CustomerQuote) => {
                this.router.navigateByUrl(`/sales/quotes/${quote.ID}`);
            },
            disabled: (rowModel) => {
                return false;
            }
        });

        contextMenuItems.push({
            label: '-------------',
            action: () => { }
        });

        contextMenuItems.push({
            label: 'Overfør til ordre',
            action: (quote: CustomerQuote) => {
                this.customerQuoteService.Transition(quote.ID, quote, 'toOrder').subscribe(() => {
                    console.log('== Quote Transistion OK ==');
                    alert('-- Overført til ordre-- OK');
                    this.table.refreshTableData();
                }, err => this.errorService.handle(err));
            },
            disabled: (rowModel) => {
                return !rowModel._links.transitions.toOrder;
            }
        });

        contextMenuItems.push({
            label: 'Overfør til faktura',
            action: (quote: CustomerQuote) => {
                this.customerQuoteService.Transition(quote.ID, quote, 'toInvoice').subscribe(() => {
                    console.log('== Quote Transistion OK ==');
                    alert('-- Overført til faktura-- OK');
                    this.table.refreshTableData();
                }, err => this.errorService.handle(err));
            },
            disabled: (rowModel) => {
                return !rowModel._links.transitions.toInvoice;
            }
        });

        contextMenuItems.push({
            label: 'Avslutt',
            action: (quote: CustomerQuote) => {
                this.customerQuoteService.Transition(quote.ID, quote, 'complete').subscribe(() => {
                    console.log('== Quote Transistion OK ==');
                    alert('Overgang til -Avslutt- OK');
                    this.table.refreshTableData();
                }, err => this.errorService.handle(err));
            },
            disabled: (rowModel) => {
                return !rowModel._links.transitions.complete;
            }
        });

        contextMenuItems.push({
            label: '-------------',
            action: () => { }
        });

        contextMenuItems.push({
            label: 'Skriv ut',
            action: (quote: CustomerQuote) => {
                this.reportDefinitionService.getReportByName('Tilbud').subscribe((report) => {
                    if (report) {
                        this.previewModal.openWithId(report, quote.ID);
                    }
                }, err => this.errorService.handle(err));
            },
            disabled: (rowModel) => {
                return false;
            }
        });

        contextMenuItems.push({
            label: 'Send på epost',
            action: (quote: CustomerQuote) => {
                let sendemail = new SendEmail();
                sendemail.EntityType = 'CustomerQuote';
                sendemail.EntityID = quote.ID;
                sendemail.CustomerID = quote.CustomerID;
                sendemail.Subject = 'Tilbud ' + (quote.QuoteNumber ? 'nr. ' + quote.QuoteNumber : 'kladd');
                sendemail.Message = 'Vedlagt finner du Tilbud ' + (quote.QuoteNumber ? 'nr. ' + quote.QuoteNumber : 'kladd');
            
                this.sendEmailModal.openModal(sendemail);

                if (this.sendEmailModal.Changed.observers.length === 0) {
                    this.sendEmailModal.Changed.subscribe((email) => {
                        this.reportDefinitionService.generateReportSendEmail('Tilbud id', email);
                    }, err => this.errorService.handle(err));
                }
            }
        });

        // Define columns to use in the table
        var quoteNumberCol = new UniTableColumn('QuoteNumber', 'Tilbudsnr', UniTableColumnType.Text)
            .setFilterOperator('startswith')
            .setWidth('10%');
        var customerNumberCol = new UniTableColumn('Customer.CustomerNumber', 'Kundenr', UniTableColumnType.Text).setWidth('10%').setFilterOperator('startswith');
        var customerNameCol = new UniTableColumn('CustomerName', 'Kunde', UniTableColumnType.Text).setFilterOperator('contains');
        var quoteDateCol = new UniTableColumn('QuoteDate', 'Tilbudsdato', UniTableColumnType.Date).setWidth('10%').setFilterable(false);
        var validUntilDateCol = new UniTableColumn('ValidUntilDate', 'Gyldighetsdato', UniTableColumnType.Date).setWidth('10%').setFilterable(false);
        var taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Totalsum', UniTableColumnType.Number).setFilterOperator('eq')
            .setWidth('10%')
            .setFormat('{0:n}')
            .setCls('column-align-right');

        var statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number).setWidth('15%').setFilterable(false);
        statusCol.setTemplate((dataItem) => {
            return this.customerQuoteService.getStatusText(dataItem.StatusCode);
        });

        // Setup table
        this.quoteTable = new UniTableConfig(false, true)
            .setPageSize(25)
            .setSearchable(true)
            .setColumns([quoteNumberCol, customerNumberCol, customerNameCol, quoteDateCol, validUntilDateCol, taxInclusiveAmountCol, statusCol])
            .setContextMenu(contextMenuItems);
    }

    public onRowSelected(event) {
        this.router.navigateByUrl('/sales/quotes/' + event.rowModel.ID);
    };
}
