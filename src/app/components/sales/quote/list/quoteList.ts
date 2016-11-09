import { IToolbarConfig } from './../../../common/toolbar/toolbar';
import {Component, ViewChild} from '@angular/core';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from 'unitable-ng2/main';
import {Router} from '@angular/router';
import {URLSearchParams} from '@angular/http';

import {CustomerQuoteService, ReportDefinitionService, UserService} from '../../../../services/services';
import {CustomerQuote, CompanySettings, User} from '../../../../unientities';

import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {SendEmailModal} from '../../../common/modals/sendEmailModal';
import {SendEmail} from '../../../../models/sendEmail';
import {AuthService} from '../../../../../framework/core/authService';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {CompanySettingsService} from '../../../../services/common/CompanySettingsService';

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
    private companySettings: CompanySettings;
    private user: User;

    private toolbarconfig: IToolbarConfig = {
        title: 'Tilbud',
        omitFinalCrumb: true
    };

    constructor(private router: Router,
        private customerQuoteService: CustomerQuoteService,
        private reportDefinitionService: ReportDefinitionService,
        private tabService: TabService,
        private authService: AuthService,
        private userService: UserService,
        private toastService: ToastService,
        private companySettingsService: CompanySettingsService) {

        this.tabService.addTab({ name: 'Tilbud', url: '/sales/quotes', active: true, moduleID: UniModules.Quotes });
        this.setupQuoteTable();
    }

    private log(err) {
        alert(err._body);
    }

    public createQuote() {
        this.router.navigateByUrl('/sales/quotes/0');
        //this.customerQuoteService.newCustomerQuote().then(quote => {
        //    this.customerQuoteService.Post(quote)
        //        .subscribe(
        //        (data) => {
        //            this.router.navigateByUrl('/sales/quotes/' + data.ID);
        //        },
        //        (err) => {
        //            console.log('Error creating quote: ', err);
        //            this.log(err);
        //        }
        //        );
        //});
    }

    private setupQuoteTable() {
        this.companySettingsService.Get(1, ['DefaultEmail'])
            .subscribe(settings => this.companySettings = settings,
                err => {
                    console.log('Error retrieving company settings data: ', err);
                    this.toastService.addToast('En feil oppsto ved henting av firmainnstillinger: ' + JSON.stringify(err), ToastType.bad);
                });

        let jwt = this.authService.jwtDecoded;
        this.userService.Get(`?filter=GlobalIdentity eq '${jwt.nameid}'`).subscribe((users) => {
            this.user = users[0];
        });

        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams || new URLSearchParams();
            urlParams.set('expand', 'Customer,Customer.Info,Customer.Info.DefaultEmail');

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
                    alert('-- Overført til faktura-- OK');
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

        contextMenuItems.push({
            label: 'Send på epost',
            action: (quote: CustomerQuote) => {
                let sendemail = new SendEmail();
                sendemail.EntityType = 'CustomerQuote';
                sendemail.EntityID = quote.ID;
                sendemail.Subject = 'Tilbud ' + (quote.QuoteNumber ? 'nr. ' + quote.QuoteNumber : 'kladd');
                sendemail.EmailAddress = quote.Customer.Info.DefaultEmail ? quote.Customer.Info.DefaultEmail.EmailAddress : '';
                sendemail.CopyAddress = this.user.Email;
                sendemail.Message = 'Vedlagt finner du Tilbud ' + (quote.QuoteNumber ? 'nr. ' + quote.QuoteNumber : 'kladd') +
                                    '\n\nMed vennlig hilsen\n' +
                                    this.companySettings.CompanyName + '\n' +
                                    this.user.DisplayName + '\n' +
                                    (this.companySettings.DefaultEmail ? this.companySettings.DefaultEmail.EmailAddress : '');

                this.sendEmailModal.openModal(sendemail);

                if (this.sendEmailModal.Changed.observers.length === 0) {
                    this.sendEmailModal.Changed.subscribe((email) => {
                        this.reportDefinitionService.generateReportSendEmail('Tilbud id', email);
                    });
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
