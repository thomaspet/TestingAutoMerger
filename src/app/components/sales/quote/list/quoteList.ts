import {Component, ViewChild, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {CompanySettings} from '../../../../unientities';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {SendEmailModal} from '../../../common/modals/sendEmailModal';
import {SendEmail} from '../../../../models/sendEmail';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {ISummaryConfig} from '../../../common/summary/summary';
import {ITickerActionOverride, TickerAction, ITickerColumnOverride} from '../../../../services/common/uniTickerService';
import * as moment from 'moment';
import {
    CustomerQuoteService,
    ReportDefinitionService,
    ErrorService,
    CompanySettingsService,
    ReportService
} from '../../../../services/services';

@Component({
    selector: 'quote-list',
    templateUrl: './quoteList.html'
})
export class QuoteList implements OnInit {
    @ViewChild(SendEmailModal) private sendEmailModal: SendEmailModal;

    private actionOverrides: Array<ITickerActionOverride> = [
        {
            Code: 'quote_sendemail',
            ExecuteActionHandler: (selectedRows) => this.onSendEmail(selectedRows)
        }
    ];

    private columnOverrides: Array<ITickerColumnOverride> = [

 {
            Field: 'StatusCode',
            Template: (dataItem) => {
                let statusText: string = this.customerQuoteService.getStatusText(dataItem.CustomerQuoteStatusCode);
                return statusText;
            }
        }

     ];

    private tickercode: string = 'quote_list';

    private companySettings: CompanySettings;
    private baseCurrencyCode: string;
    private printStatusPrinted: string = '200';

    constructor(
        private uniHttpService: UniHttp,
        private router: Router,
        private customerQuoteService: CustomerQuoteService,
        private reportDefinitionService: ReportDefinitionService,
        private tabService: TabService,
        private toastService: ToastService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private reportService: ReportService
    ) { }

    public ngOnInit() {
        this.companySettingsService.Get(1)
            .subscribe(settings => {
                this.companySettings = settings;
                if (this.companySettings && this.companySettings.BaseCurrencyCode) {
                    this.baseCurrencyCode = this.companySettings.BaseCurrencyCode.Code;
                }
            }, err => this.errorService.handle(err)
            );

        this.tabService.addTab({
            url: '/sales/quotes',
            name: 'Tilbud',
            active: true,
            moduleID: UniModules.Quotes
        });
    }

    public createQuote() {
        this.router.navigateByUrl('/sales/quotes/0');
    }


    private onSendEmail(selectedRows: Array<any>): Promise<any> {
        let quote = selectedRows[0];

        return new Promise((resolve, reject) => {
            let sendemail = new SendEmail();
            sendemail.EntityType = 'CustomerQuote';
            sendemail.EntityID = quote.ID;
            sendemail.CustomerID = quote.CustomerID;
            sendemail.Subject = 'Tilbud ' + (quote.CustomerQuoteQuoteNumber ? 'nr. ' + quote.CustomerQuoteQuoteNumber : 'kladd');
            sendemail.Message = 'Vedlagt finner du Tilbud ' + (quote.CustomerQuoteQuoteNumber ? 'nr. ' + quote.CustomerQuoteQuoteNumber : 'kladd');

            this.sendEmailModal.openModal(sendemail);

            if (this.sendEmailModal.Changed.observers.length === 0) {
                this.sendEmailModal.Changed.subscribe((email) => {
                    this.reportService.generateReportSendEmail('Tilbud id', email);
                    resolve();
                });
            }
        });
    }

}
