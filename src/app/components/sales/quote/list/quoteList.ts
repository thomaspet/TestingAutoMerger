import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {CompanySettings} from '../../../../unientities';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {SendEmail} from '../../../../models/sendEmail';
import {ToastService} from '../../../../../framework/uniToast/toastService';
import {UniTickerWrapper} from '../../../uniticker/tickerWrapper/tickerWrapper';
import {ITickerActionOverride, ITickerColumnOverride} from '../../../../services/common/uniTickerService';
import {UniModalService, UniSendEmailModal, ConfirmActions} from '../../../../../framework/uniModal/barrel';
import {
    CustomerQuoteService,
    ReportDefinitionService,
    ErrorService,
    CompanySettingsService,
    EmailService
} from '../../../../services/services';

@Component({
    selector: 'quote-list',
    templateUrl: './quoteList.html'
})
export class QuoteList implements OnInit {

    @ViewChild(UniTickerWrapper) private tickerWrapper: UniTickerWrapper;

    public actionOverrides: ITickerActionOverride[] = [{
        Code: 'quote_sendemail',
        ExecuteActionHandler: (selectedRows) => this.onSendEmail(selectedRows)
    },
    {
        Code: 'quote_delete',
        ExecuteActionHandler: (selectedRows) => this.deleteQuotes(selectedRows)
    },
    {
        Code: 'quote_print',
        AfterExecuteActionHandler: (selectedRows) => this.onAfterPrintQuote(selectedRows)
    }
];

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
        private modalService: UniModalService,
        private emailService: EmailService
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

    private onAfterPrintQuote(selectedRows: Array<any>): Promise<any> {
        return new Promise((resolve, reject) => {
            let invoice = selectedRows[0];
            this.customerQuoteService
                .setPrintStatus(invoice.ID, this.printStatusPrinted)
                    .subscribe((printStatus) => {
                        resolve();
                    }, err => {
                        reject(err);
                        this.errorService.handle(err);
                    }
                );
        });
    }

    private deleteQuotes(selectedRows: Array<any>): Promise<any> {
        let quote = selectedRows[0];
        return new Promise((resolve, reject) => {
            this.modalService.confirm({
                header: 'Slette tilbud?',
                message: 'Vil du slette dette tilbudet?',
                buttonLabels: {
                    accept: 'Slett',
                    cancel: 'Avbryt'
                }
            }).onClose.subscribe(answer => {
                if (answer === ConfirmActions.ACCEPT) {
                    resolve(
                        this.customerQuoteService.Remove(quote.ID, null)
                            .toPromise()
                            .then(() => this.tickerWrapper.refreshTicker())
                            .catch(err => this.errorService.handle(err))
                    );
                }
                resolve();
            });
        });
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
                    this.emailService.sendEmailWithReportAttachment('Tilbud id', email, null);
                }
                resolve();
            });
        });
    }

}
