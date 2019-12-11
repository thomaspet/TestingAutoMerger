import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerQuote} from '../../unientities';
import {StatusCodeCustomerQuote} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {ErrorService} from '../common/errorService';
import {ITickerActionOverride} from '../../services/common/uniTickerService';
import {UniModalService} from '../../../framework/uni-modal/modalService';
import {ConfirmActions} from '@uni-framework/uni-modal/interfaces';
import {ReportTypeEnum} from '@app/models/reportTypeEnum';
import {TofEmailModal} from '@uni-framework/uni-modal/modals/tof-email-modal/tof-email-modal';

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
    ) {
        super(http);
        this.relativeURL = CustomerQuote.RelativeUrl;
        this.entityType = CustomerQuote.EntityType;
        this.DefaultOrderBy = null;
        this.defaultExpand = ['Customer'];
    }

    public setPrintStatus(quoteId: number, printStatus: string): Observable<any> {
        return super.PutAction(quoteId, 'set-customer-quote-printstatus', 'ID=' + quoteId + '&printStatus=' + printStatus);
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

    public deleteQuotes(selectedRows: Array<any>): Promise<any> {
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
        this.modalService.open(TofEmailModal, {
            data: {
                entity: quote,
                entityType: 'CustomerQuote',
                reportType: ReportTypeEnum.QUOTE
            }
        });

        return Promise.resolve();
    }
}
