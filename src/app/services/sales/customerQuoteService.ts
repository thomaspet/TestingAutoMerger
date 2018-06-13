import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerQuote, CustomerQuoteItem, LocalDate} from '../../unientities';
import {StatusCodeCustomerQuote} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {ErrorService} from '../common/errorService';
import { ITickerActionOverride } from '../../services/common/uniTickerService';
import { ReportDefinitionService } from '../../services/reports/reportDefinitionService';
import { ReportDefinitionParameterService } from '../../services/reports/reportDefinitionParameterService';
import { SendEmail } from '../../models/sendEmail';
import { ToastService, ToastType } from '../../../framework/uniToast/toastService';
import { CompanySettingsService } from '../common/companySettingsService';
import { EmailService } from '../common/emailService';
import { UniModalService } from '../../../framework/uni-modal/modalService';
import { UniSendEmailModal } from '../../../framework/uni-modal/modals/sendEmailModal';
import { UniRegisterPaymentModal } from '../../../framework/uni-modal/modals/registerPaymentModal';
import * as moment from 'moment';
import { ConfirmActions } from '@uni-framework/uni-modal/interfaces';
import { IUniSaveAction } from '@uni-framework/save/save';

@Injectable()
export class CustomerQuoteService extends BizHttp<CustomerQuote> {

    // TODO: To be retrieved from database schema shared.Status instead?
    public statusTypes: Array<any> = [
        { Code: StatusCodeCustomerQuote.Draft, Text: 'Kladd' },
        { Code: StatusCodeCustomerQuote.Registered, Text: 'Registrert' },
        // { Code: StatusCodeCustomerQuote.ShippedToCustomer, Text: 'Sendt til kunde' }, // Not available yet
        // { Code: StatusCodeCustomerQuote.CustomerAccepted, Text: 'Kunde har godkjent' }, // Not available yet
        { Code: StatusCodeCustomerQuote.TransferredToOrder, Text: 'Overført til ordre' },
        { Code: StatusCodeCustomerQuote.TransferredToInvoice, Text: 'Overført til faktura' },
        { Code: StatusCodeCustomerQuote.Completed, Text: 'Avsluttet' }
    ];

    public actionOverrides: ITickerActionOverride[] = [
        {
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

    public printStatusPrinted: string = '200';
    public getFilteredStatusTypes(statusCode: number): Array<any> {
        const statusTypesFiltered: Array<any> = [];

        this.statusTypes.forEach((s, i) => {
            if (s.Code === StatusCodeCustomerQuote.Draft &&
                statusCode !== StatusCodeCustomerQuote.Draft) {
                return;
            } else if (s.Code === StatusCodeCustomerQuote.Completed &&
                statusCode !== StatusCodeCustomerQuote.Completed) {
                return;
            } else if (s.Code === StatusCodeCustomerQuote.TransferredToInvoice &&
                statusCode === StatusCodeCustomerQuote.Completed) {
                return;
            } else {
                statusTypesFiltered.push(s);
            }
        });
        return statusTypesFiltered;
    }


    constructor(
        http: UniHttp,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private emailService: EmailService,
        private reportDefinitionService: ReportDefinitionService,
        private reportDefinitionParameterService: ReportDefinitionParameterService,
        private companySettingsService: CompanySettingsService,
    ) {
        super(http);
        this.relativeURL = CustomerQuote.RelativeUrl;
        this.entityType = CustomerQuote.EntityType;
        this.DefaultOrderBy = null;
        this.defaultExpand = ['Customer'];
    }

    public next(currentID: number): Observable<CustomerQuote> {
        return super.GetAction(currentID, 'next');
    }

    public previous(currentID: number): Observable<CustomerQuote> {
        return super.GetAction(currentID, 'previous');
    }

    public setPrintStatus(quoteId: number, printStatus: string): Observable<any> {
        return super.PutAction(quoteId, 'set-customer-quote-printstatus', 'ID=' + quoteId + '&printStatus=' + printStatus);
    }

    public newCustomerQuote(): Promise<CustomerQuote> {
        return new Promise(resolve => {
            this.GetNewEntity([], CustomerQuote.EntityType).subscribe((quote: CustomerQuote) => {
                quote.QuoteDate = new LocalDate(new Date());
                quote.ValidUntilDate = new LocalDate(moment().add(1, 'month').toDate());

                resolve(quote);
            }, err => this.errorService.handle(err));
        });
    }

    public getGroupCounts() {
        const route = '?model=customerquote&select=count(id),statuscode&filter=isnull(deleted,0) eq 0';
        return this.http.asGET()
            .usingStatisticsDomain()
            .withEndPoint(route)
            .send()
            .map((res) => {
                const data = (res.json() || {}).Data || [];
                return data.reduce((counts, group) => {
                    if (group.CustomerQuoteStatusCode) {
                        counts[group.CustomerQuoteStatusCode] = group.countid;
                    }
                    return counts;
                }, {});
            });
    }

    public calculateQuoteSummary(quoteItems: Array<CustomerQuoteItem>): Observable<any> {
        super.invalidateCache();
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(quoteItems)
            .withEndPoint(this.relativeURL + '?action=calculate-quote-summary')
            .send()
            .map(response => response.json());
    }

    public getStatusText(statusCode: number): string {
        const statusType = this.statusTypes.find(x => x.Code === statusCode);
        return statusType ? statusType.Text : '';
    }

    public onAfterPrintQuote(selectedRows: Array<any>): Promise<any> {
        return new Promise((resolve, reject) => {
            const invoice = selectedRows[0];
            this.setPrintStatus(invoice.ID, this.printStatusPrinted)
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
        const quote = selectedRows[0];
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
                        this.Remove(quote.ID, null).subscribe(
                            res => resolve(),
                            err => {
                                this.errorService.handle(err);
                                resolve();
                            }
                        )
                    );
                } else {
                    resolve();
                }
            });
        });
    }

    public onSendEmail(selectedRows: Array<any>): Promise<any> {
        const quote = selectedRows[0];

        return new Promise((resolve, reject) => {
            this.companySettingsService.Get(1)
                .subscribe(settings => {
                    Observable.forkJoin(
                        this.reportDefinitionService.getReportByID(
                            settings['DefaultCustomerQuoteReportID']
                        ),
                        this.reportDefinitionParameterService.GetAll(
                            'filter=ReportDefinitionId eq ' + settings['DefaultCustomerQuoteReportID']
                        )
                    ).subscribe(data => {
                        if (data[0] && data[1]) {
                            const defaultQuoteReportForm = data[0];
                            const defaultReportParameterName = data[1][0].Name;

                            const model = new SendEmail();
                            model.EntityType = 'CustomerQuote';
                            model.EntityID = quote.ID;
                            model.CustomerID = quote.CustomerID;

                            const quoteNumber = (quote.QuoteNumber)
                                ? ` nr. ${quote.QuoteNumber}`
                                : 'kladd';

                            model.Subject = 'Tilbud' + quoteNumber;
                            model.Message = 'Vedlagt finner du tilbud' + quoteNumber;

                            const value = defaultReportParameterName === 'Id'
                                ? quote[defaultReportParameterName.toUpperCase()]
                                : quote[defaultReportParameterName];
                            const parameters = [{ Name: defaultReportParameterName, value: value }];

                            this.modalService.open(UniSendEmailModal, {
                                data: model
                            }).onClose.subscribe(email => {
                                if (email) {
                                    this.emailService.sendEmailWithReportAttachment(defaultQuoteReportForm.Name, email, parameters);
                                }
                                resolve();
                            }, err => {
                                this.errorService.handle(err);
                                resolve();
                            });
                        }
                    }, err => this.errorService.handle(err));
                }, err => this.errorService.handle(err)
            );
        });
    }
}
