import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {CompanySettings} from '../../../../unientities';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {SendEmail} from '../../../../models/sendEmail';
import {ToastService} from '../../../../../framework/uniToast/toastService';

import {ITickerActionOverride, ITickerColumnOverride} from '../../../../services/common/uniTickerService';
import {UniModalService, UniSendEmailModal} from '../../../../../framework/uniModal/barrel';
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
    public actionOverrides: ITickerActionOverride[] = [{
        Code: 'quote_sendemail',
        ExecuteActionHandler: (selectedRows) => this.onSendEmail(selectedRows)
    }];

    public columnOverrides: ITickerColumnOverride[] = [{
        Field: 'StatusCode',
        Template: (dataItem) => {
            let statusText: string = this.customerQuoteService.getStatusText(dataItem.CustomerQuoteStatusCode);
            return statusText;
        }
    }];

    public tickercode: string = 'quote_list';

    private companySettings: CompanySettings;
    private baseCurrencyCode: string;
    public printStatusPrinted: string = '200';

    constructor(
        private uniHttpService: UniHttp,
        private router: Router,
        private customerQuoteService: CustomerQuoteService,
        private reportDefinitionService: ReportDefinitionService,
        private tabService: TabService,
        private toastService: ToastService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private reportService: ReportService,
        private modalService: UniModalService
    ) {}

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
            let model = new SendEmail();
            model.EntityType = 'CustomerQuote';
            model.EntityID = quote.ID;
            model.CustomerID = quote.CustomerID;

            const quoteNumber = quote.QuoteNumber ? ` nr. ${quote.QuoteNumber}` : 'kladd';
            model.Subject = 'Tilbud' + quoteNumber;
            model.Message = 'Vedlagt finner du tilbud' + quoteNumber;

            this.modalService.open(UniSendEmailModal, {
                data: model
            }).onClose.subscribe(email => {
                if (email) {
                    this.reportService.generateReportSendEmail('Tilbud id', email, null);
                }
                resolve();
            });
        });
    }

}
