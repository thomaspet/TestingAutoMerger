import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {StatisticsService} from './statisticsService';
import {ErrorService} from './errorService';
import {UserService} from './userService';
import {User, StatusCodeSharing} from '../../unientities';
import {CustomerInvoiceService} from '../sales/customerInvoiceService';
import {CustomerOrderService} from '../sales/customerOrderService';
import {CustomerQuoteService} from '../sales/customerQuoteService';
import {CustomerInvoiceItemService} from '../sales/customerInvoiceItemService';
import {CustomerOrderItemService} from '../sales/customerOrderItemService';
import {CustomerQuoteItemService} from '../sales/customerQuoteItemService';

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
        private customerQuoteItemService: CustomerQuoteItemService
    ) {}

    public getStatusText(statusCode: number): string {
        if (this.statusDictionary) {
            let status = this.statusDictionary[statusCode];
            return status ? status.name : '';
        }

        return null;
    }

    public getStatusCodesForEntity(entityType: string): Array<StatusCode> {
        let statusCodes: Array<StatusCode> = [];
        if (this.statusDictionary) {
            Object.keys(this.statusDictionary).forEach(x => {
                let status = this.statusDictionary[x];
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
            if (!this.statusDictionary) {
                // get statuses from API and add it to the cache
                this.statisticsService.GetAll('model=Status&select=StatusCode,Description,EntityType')
                    .subscribe(data => {
                        if (data.Data) {
                            this.statusDictionary = {};
                            data.Data.forEach(item => {
                                let name: string = item.StatusDescription;
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
                                    case 'Sharing':
                                        name = this.getSharingStatusText(item.StatusStatusCode);
                                    // TODO: Add when Quote Item status flow is implemented in back-end
                                    // case 'CustomerQuoteItem':
                                    //     name = this.customerQuoteItemService.getStatusText(item.StatusStatusCode);
                                    //     break;
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
                    }, err => this.errorService.handle(err));
            }

            resolve(true);
        });
    }

    public getSharingStatusText(statusCode: number): string {
        switch (statusCode) {
            case StatusCodeSharing.Completed:
                return 'Fullført';
            case StatusCodeSharing.Failed:
                return 'Feilet';
            default:
                return 'Behandles';
        }
    }

    public getStatusLogEntries(entityType: string, entityID: number, toStatus: number): Observable<any> {
        return Observable.forkJoin(
            this.userService.GetAll(null),
            this.statisticsService.GetAll(
                `model=StatusLog&filter=EntityType eq '${entityType}' and EntityID eq ${entityID} and ToStatus eq ${toStatus}&select=StatusLog.CreatedAt as CreatedAt,StatusLog.CreatedBy as CreatedBy,StatusLog.FromStatus as FromStatus,ToStatus as ToStatus,StatusLog.EntityID as StatusLogEntityID,StatusLog.EntityType as StatusLogEntityType`),
            this.loadStatusCache()
        ).map(responses => {
                let users: Array<User> = responses[0];
                let data = responses[1].Data ? responses[1].Data : [];
                data.forEach(item => {
                    item.FromStatusText = this.getStatusText(item.FromStatus);
                    let createdByUser = users.find(x => x.GlobalIdentity === item.CreatedBy);
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
