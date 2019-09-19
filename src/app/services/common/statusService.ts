import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {StatisticsService} from './statisticsService';
import {ErrorService} from './errorService';
import {UserService} from './userService';
import {User, StatusCodeSharing} from '../../unientities';
import {CustomerInvoiceService} from '../sales/customerInvoiceService';
import {CustomerOrderService} from '../sales/customerOrderService';
import {CustomerQuoteService} from '../sales/customerQuoteService';
import {CustomerInvoiceItemService} from '../sales/customerInvoiceItemService';
import {CustomerOrderItemService} from '../sales/customerOrderItemService';
import {RecurringInvoiceService} from '../sales/recurringInvoiceService';
import {PaymentService} from '../accounting/paymentService';
import {PaymentBatchService} from '../accounting/paymentBatchService';
import { SupplierInvoiceService } from '../accounting/supplierInvoiceService';
import {JournalEntryLineService} from '../accounting/journalEntryLineService';

@Injectable()
export class StatusService {
    private statusDictionary: {[StatusCode: number]: {name: string, entityType: string}};

    constructor(
        private statisticsService: StatisticsService,
        private userService: UserService,
        private errorService: ErrorService,
        private customerInvoiceService: CustomerInvoiceService,
        private customerOrderService: CustomerOrderService,
        private customerQuoteService: CustomerQuoteService,
        private customerInvoiceItemService: CustomerInvoiceItemService,
        private customerOrderItemService: CustomerOrderItemService,
        private recurringInvoiceService: RecurringInvoiceService,
        private paymentService: PaymentService,
        private paymentBatchService: PaymentBatchService,
        private supplierInvoiceService: SupplierInvoiceService,
        private journalEntryLineService: JournalEntryLineService
    ) {}

    public getStatusText(statusCode: number): string {
        if (this.statusDictionary) {
            const status = this.statusDictionary[statusCode];
            return status ? status.name : '';
        }

        return null;
    }

    public getStatusCodesForEntity(entityType: string): Array<StatusCode> {
        const statusCodes: Array<StatusCode> = [];
        if (this.statusDictionary) {
            Object.keys(this.statusDictionary).forEach(x => {
                const status = this.statusDictionary[x];
                if (status.entityType === entityType) {
                    statusCodes.push({
                        statusCode: +x,
                        name: status.name,
                        entityType: status.entityType
                    });
                }
            });
        }
        return statusCodes;
    }

    public loadStatusCache(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.statusDictionary) {
                resolve(true);
            } else {
                this.statisticsService.GetAll(
                    'model=Status&select=StatusCode,Description,EntityType'
                ).subscribe(
                    data => {
                        if (data.Data) {
                            this.statusDictionary = {};
                            data.Data.forEach(item => {
                                let name;
                                switch (item.StatusEntityType) {
                                    case 'CustomerInvoice':
                                        name = this.customerInvoiceService.getStatusText(item.StatusStatusCode, 0);
                                        break;
                                    case 'CustomerOrder':
                                        name = this.customerOrderService.getStatusText(item.StatusStatusCode);
                                        break;
                                    case 'CustomerQuote':
                                        name = this.customerQuoteService.getStatusText(item.StatusStatusCode);
                                        break;
                                    case 'CustomerInvoiceItem':
                                        name = this.customerInvoiceItemService.getStatusText(item.StatusStatusCode, 0);
                                        break;
                                    case 'CustomerOrderItem':
                                        name = this.customerOrderItemService.getStatusText(item.StatusStatusCode);
                                        break;
                                    case 'RecurringInvoice':
                                        name = this.recurringInvoiceService.getStatusText(item.StatusStatusCode);
                                        break;
                                    case 'Payment':
                                        name = this.paymentService.getStatusText(item.StatusStatusCode);
                                        break;
                                    case 'PaymentBatch':
                                        name = this.paymentBatchService.getStatusText(item.StatusStatusCode, false);
                                        break;
                                    case 'Sharing':
                                        name = this.getSharingStatusText(item.StatusStatusCode);
                                        break;
                                    case 'JournalEntryLine':
                                        name = this.journalEntryLineService.getStatusText(item.StatusStatusCode);
                                        break;
                                    case 'SupplierInvoice':
                                        name = this.supplierInvoiceService.getStatusText(item.StatusStatusCode);
                                    // TODO: Add when Quote Item status flow is implemented in back-end
                                    // case 'CustomerQuoteItem':
                                    //     name = this.customerQuoteItemService.getStatusText(item.StatusStatusCode);
                                    //     break;
                                }

                                if (!name) {
                                    name = item.StatusDescription;
                                }

                                this.statusDictionary[item.StatusStatusCode] = {
                                    name: name,
                                    entityType: item.StatusEntityType
                                };
                            });

                            resolve(true);
                        } else {
                            reject('Could not get statuses from API');
                        }
                    },
                    err => this.errorService.handle(err)
                );
            }
        });
    }

    public getSharingStatusText(statusCode: number): string {
        switch (statusCode) {
            case StatusCodeSharing.Cancelled:
                return 'Avbrutt';
            case StatusCodeSharing.Pending:
                return 'I kø';
            case StatusCodeSharing.Completed:
                return 'Fullført';
            case StatusCodeSharing.Failed:
                return 'Feilet';
            default:
                return 'Behandles';
        }
    }

    public getStatusLogEntries(entityType: string, entityID: number): Observable<any> {
        return Observable.forkJoin(
            this.userService.GetAll(null),
            this.statisticsService.GetAll(
                `model=StatusLog&filter=EntityType eq '${entityType}' and EntityID eq ${entityID} and ToStatus gt 0`
                + `&select=StatusLog.CreatedAt as CreatedAt,StatusLog.CreatedBy as CreatedBy,StatusLog.FromStatus as FromStatus,`
                + `ToStatus as ToStatus,StatusLog.EntityID as StatusLogEntityID,StatusLog.EntityType as StatusLogEntityType`
            ),
            this.loadStatusCache()
        ).map(responses => {
                const users: Array<User> = responses[0];
                const data = responses[1].Data ? responses[1].Data : [];
                data.forEach(item => {
                    item.FromStatusText = this.getStatusText(item.FromStatus);
                    item.ToStatusText = this.getStatusText(item.ToStatus);
                    const createdByUser = users.find(x => x.GlobalIdentity === item.CreatedBy);
                    item.CreatedByName = createdByUser ? createdByUser.DisplayName : '';
                });
                return data;
            });
    }
}

export class StatusCode {
    public statusCode: number;
    public name: string;
    public entityType: string;
}
