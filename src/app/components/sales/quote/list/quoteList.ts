import {IToolbarConfig} from './../../../common/toolbar/toolbar';
import {Component, ViewChild} from '@angular/core';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from 'unitable-ng2/main';
import {Router} from '@angular/router';
import {URLSearchParams} from '@angular/http';

import {CustomerQuoteService, ReportDefinitionService, ErrorService, CompanySettingsService} from '../../../../services/services';
import {CustomerQuote, StatusCodeCustomerQuote, CompanySettings} from '../../../../unientities';

import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {SendEmailModal} from '../../../common/modals/sendEmailModal';
import {SendEmail} from '../../../../models/sendEmail';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import * as moment from 'moment';

@Component({
    selector: 'quote-list',
    templateUrl: './quoteList.html'
})
export class QuoteList {
    @ViewChild(PreviewModal) private previewModal: PreviewModal;
    @ViewChild(UniTable) public table: UniTable;
    @ViewChild(SendEmailModal) private sendEmailModal: SendEmailModal;

    private quoteTable: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;
    private companySettings: CompanySettings;
    private baseCurrencyCode: string;

    public toolbarconfig: IToolbarConfig = {
        title: 'Tilbud',
        omitFinalCrumb: true
    };

    private filterTabs: any[] = [
        {label: 'Alle'},
        {label: 'Kladd', statuscode: StatusCodeCustomerQuote.Draft},
        {label: 'Registrert', statuscode: StatusCodeCustomerQuote.Registered},
        {label: 'Overført ordre', statuscode: StatusCodeCustomerQuote.TransferredToOrder},
        {label: 'Overført faktura', statuscode: StatusCodeCustomerQuote.TransferredToInvoice}
    ];
    private activeTab: any = this.filterTabs[0];

    constructor(
        private router: Router,
        private customerQuoteService: CustomerQuoteService,
        private reportDefinitionService: ReportDefinitionService,
        private tabService: TabService,
        private toastService: ToastService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService
    ) {}

    public ngOnInit() {
        this.companySettingsService.Get(1)
            .subscribe(settings => {
                this.companySettings = settings;
                if (this.companySettings && this.companySettings.BaseCurrencyCode) {
                    this.baseCurrencyCode = this.companySettings.BaseCurrencyCode.Code;
                }
                this.setupQuoteTable();
                this.getGroupCounts();
            }, err => this.errorService.handle(err)
        );

        this.tabService.addTab({
            name: 'Tilbud',
            url: '/sales/quotes',
            active: true,
            moduleID: UniModules.Quotes
        });
    }

    public createQuote() {
        this.router.navigateByUrl('/sales/quotes/0');
    }

    private getGroupCounts() {
        this.customerQuoteService.getGroupCounts().subscribe((counts) => {
            this.filterTabs.forEach((filter) => {
                filter['count'] = counts[filter.statuscode];
            });
        });
    }

    public onFilterTabClick(tab) {
        this.activeTab = tab;
        if (tab.statuscode) {
            this.table.setFilters([{
                field: 'StatusCode',
                operator: 'eq',
                value: tab.statuscode,
                group: 1
            }]);
        } else {
            this.table.removeFilter('StatusCode');
        }
    }

    private setupQuoteTable() {
        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams || new URLSearchParams();
            urlParams.set('expand', 'Customer,CurrencyCode');

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
            label: 'Overfør til ordre',
            action: (quote: CustomerQuote) => {
                const toastID = this.toastService.addToast('Overfører til ordre', ToastType.warn);
                this.customerQuoteService.Transition(quote.ID, quote, 'toOrder').subscribe((res) => {
                    this.toastService.removeToast(toastID);
                    this.router.navigateByUrl('/sales/orders/' + res.CustomerOrderID);
                },
                (err) => {
                    this.toastService.removeToast(toastID);
                    this.errorService.handle(err);
                });
            },
            disabled: (rowModel) => {
                return !rowModel._links.transitions.toOrder;
            }
        });

        contextMenuItems.push({
            label: 'Overfør til faktura',
            action: (quote: CustomerQuote) => {
                const toastID = this.toastService.addToast('Overfører til faktura', ToastType.warn);
                this.customerQuoteService.Transition(quote.ID, quote, 'toInvoice').subscribe((res) => {
                    this.toastService.removeToast(toastID);
                    this.router.navigateByUrl('/sales/invoices/' + res.CustomerInvoiceID);
                },
                (err) => {
                    this.toastService.removeToast(toastID);
                    this.errorService.handle(err);
                });
            },
            disabled: (rowModel) => {
                return !rowModel._links.transitions.toInvoice;
            }
        });

        contextMenuItems.push({
            label: 'Avslutt',
            action: (quote: CustomerQuote) => {
                const toastID = this.toastService.addToast('Avslutter tilbud', ToastType.warn);
                this.customerQuoteService.Transition(quote.ID, quote, 'complete').subscribe(() => {
                    this.toastService.removeToast(toastID);
                    this.getGroupCounts();
                    this.table.refreshTableData();
                },
                (err) => {
                    this.toastService.removeToast(toastID);
                    this.errorService.handle(err);
                });
            },
            disabled: (rowModel) => {
                return !rowModel._links.transitions.complete;
            }
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
                const quoteNumber = (quote.QuoteNumber) ? 'nr. ' + quote.QuoteNumber : '(kladd)';
                let sendemail = new SendEmail();
                sendemail.EntityType = 'CustomerQuote';
                sendemail.EntityID = quote.ID;
                sendemail.CustomerID = quote.CustomerID;
                sendemail.Subject = 'Tilbud ' + quoteNumber;
                sendemail.Message = 'Vedlagt finner du Tilbud ' + quoteNumber;

                this.sendEmailModal.openModal(sendemail);

                if (this.sendEmailModal.Changed.observers.length === 0) {
                    this.sendEmailModal.Changed.subscribe((email) => {
                        this.reportDefinitionService.generateReportSendEmail('Tilbud id', email);
                    }, err => this.errorService.handle(err));
                }
            }
        });

        // Define columns to use in the table
        const quoteNumberCol = new UniTableColumn('QuoteNumber', 'Tilbudsnr', UniTableColumnType.Text)
            .setWidth('100px').setFilterOperator('startswith');

        const customerNumberCol = new UniTableColumn('Customer.CustomerNumber', 'Kundenr', UniTableColumnType.Text)
            .setWidth('100px').setFilterOperator('startswith')
            .setTemplate((quote) => {
                return quote.CustomerID ? `<a href='/#/sales/customer/${quote.CustomerID}'>${quote.Customer.CustomerNumber}</a>` : ``;
            });

        const customerNameCol = new UniTableColumn('CustomerName', 'Kunde', UniTableColumnType.Text)
            .setFilterOperator('contains')
            .setTemplate((quote) => {
                return quote.CustomerID ? `<a href='/#/sales/customer/${quote.CustomerID}'>${quote.CustomerName}</a>` : ``;
            });

        const quoteDateCol = new UniTableColumn('QuoteDate', 'Tilbudsdato', UniTableColumnType.LocalDate)
            .setWidth('10%').setFilterable(false);

        const validUntilDateCol = new UniTableColumn('ValidUntilDate', 'Gyldighetsdato', UniTableColumnType.LocalDate)
            .setWidth('10%')
            .setConditionalCls((item: CustomerQuote) => {
                const ignoreDate = item.StatusCode === StatusCodeCustomerQuote.TransferredToOrder
                    || item.StatusCode === StatusCodeCustomerQuote.TransferredToInvoice
                    || item.StatusCode === StatusCodeCustomerQuote.Completed;

                return (ignoreDate || moment(item.ValidUntilDate).isAfter(moment()))
                    ? 'date-good' : 'date-bad';
            })
            .setFilterable(false);

        let currencyCodeCol = new UniTableColumn('CurrencyCode.Code', 'Valuta', UniTableColumnType.Text)
            .setWidth('5%')
            .setFilterOperator('eq')
            .setVisible(false);

        let taxInclusiveAmountCurrencyCol = new UniTableColumn('TaxInclusiveAmountCurrency', 'Totalsum', UniTableColumnType.Money)
            .setWidth('8%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setConditionalCls((item) => {
                return (+item.TaxInclusiveAmount >= 0)
                    ? 'number-good' : 'number-bad';
            })
            .setCls('column-align-right');

        const taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Totalsum ' + this.baseCurrencyCode, UniTableColumnType.Money)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setVisible(false)
            .setCls('column-align-right number-good');

        const statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number)
            .setWidth('15%')
            .setFilterable(false)
            .setTemplate((dataItem) => {
                return this.customerQuoteService.getStatusText(dataItem.StatusCode);
            });

        // Setup table
        this.quoteTable = new UniTableConfig(false, true)
            .setPageSize(25)
            .setSearchable(true)
            .setColumnMenuVisible(true)
            .setContextMenu(contextMenuItems)
            .setColumns([
                quoteNumberCol,
                customerNumberCol,
                customerNameCol,
                quoteDateCol,
                validUntilDateCol,
                currencyCodeCol,
                taxInclusiveAmountCurrencyCol,
                taxInclusiveAmountCol,
                statusCol
            ]);
    }

    public onRowSelected(event) {
        this.router.navigateByUrl('/sales/quotes/' + event.rowModel.ID);
    };
}
