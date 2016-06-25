import {Component, ViewChild} from '@angular/core';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from 'unitable-ng2/main';
import {Router} from '@angular/router-deprecated';
import {URLSearchParams} from '@angular/http';

import {CustomerQuoteService, ReportDefinitionService} from '../../../../services/services';
import {CustomerQuote} from '../../../../unientities';

import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {TabService} from '../../../layout/navbar/tabstrip/tabService';

declare var jQuery;

@Component({
    selector: 'quote-list',
    templateUrl: 'app/components/sales/quote/list/quoteList.html',
    directives: [UniTable, PreviewModal],
    providers: [CustomerQuoteService, ReportDefinitionService]
})
export class QuoteList {
    @ViewChild(PreviewModal) private previewModal: PreviewModal;
    @ViewChild(UniTable) public table: UniTable;

    private quoteTable: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;


    constructor(private router: Router,
        private customerQuoteService: CustomerQuoteService,
        private reportDefinitionService: ReportDefinitionService,
        private tabService: TabService) {

        this.tabService.addTab({ name: 'Tilbud', url: '/sales/quote', active: true, moduleID: 3 });
        this.setupQuoteTable();
    }

    private log(err) {
        alert(err._body);
    }

    public createQuote() {
        this.customerQuoteService.newCustomerQuote().then(quote => {
            this.customerQuoteService.Post(quote)
                .subscribe(
                (data) => {
                    this.router.navigateByUrl('/sales/quote/details/' + data.ID);
                },
                (err) => {
                    console.log('Error creating quote: ', err);
                    this.log(err);
                }
                );
        });
    }

    private setupQuoteTable() {
        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams || new URLSearchParams();

            if (!params.has('orderby')) {
                params.set('orderby', 'QuoteDate desc');
            }

            return this.customerQuoteService.GetAllByUrlSearchParams(params);
        };

        // Context menu
        let contextMenuItems: IContextMenuItem[] = [];
        contextMenuItems.push({
            label: 'Rediger',
            action: (quote: CustomerQuote) => {
                this.router.navigateByUrl(`/sales/quote/details/${quote.ID}`);
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
                }, (err) => {
                    console.log('== TRANSFER-TO-COMPLETED FAILED ==');
                    this.log(err);
                });
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
                    alert('-- Overf�rt til faktura-- OK');
                    this.table.refreshTableData();
                }, (err) => {
                    console.log('== TRANSFER-TO-COMPLETED FAILED ==');
                    this.log(err);
                });
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
                }, (err) => {
                    console.log('== TRANSFER-TO-COMPLETED FAILED ==');
                    this.log(err);
                });
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
                });
            },
            disabled: (rowModel) => {
                return false;
            }
        });

        // Define columns to use in the table        
        var quoteNumberCol = new UniTableColumn('QuoteNumber', 'Tilbudsnr', UniTableColumnType.Text)
            .setWidth('10%');
        var customerNumberCol = new UniTableColumn('Customer.CustomerNumber', 'Kundenr', UniTableColumnType.Text).setWidth('10%');
        var customerNameCol = new UniTableColumn('CustomerName', 'Kunde', UniTableColumnType.Text);
        var quoteDateCol = new UniTableColumn('QuoteDate', 'Tilbudsdato', UniTableColumnType.Date).setWidth('10%');
        var validUntilDateCol = new UniTableColumn('ValidUntilDate', 'Gyldighetsdato', UniTableColumnType.Date).setWidth('10%');
        var taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Totalsum', UniTableColumnType.Number)
            .setWidth('10%')
            .setFormat('{0:n}')
            .setCls('column-align-right');

        var statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number).setWidth('15%');
        statusCol.setTemplate((dataItem) => {
            return this.customerQuoteService.getStatusText(dataItem.StatusCode);
        });

        // Setup table
        this.quoteTable = new UniTableConfig(false, true)
            .setPageSize(25)
            .setColumns([quoteNumberCol, customerNumberCol, customerNameCol, quoteDateCol, validUntilDateCol, taxInclusiveAmountCol, statusCol])
            .setContextMenu(contextMenuItems);
    }

    public onRowSelected(event) {
        this.router.navigateByUrl('/sales/quote/details/' + event.rowModel.ID);
    };
}
