import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CustomerOrder, StatusCodeCustomerOrder} from '@uni-entities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {ErrorService} from '../common/errorService';
import {ITickerActionOverride} from '../../services/common/uniTickerService';
import {UniModalService} from '../../../framework/uni-modal/modalService';
import {ConfirmActions} from '@uni-framework/uni-modal/interfaces';
import {ReportTypeEnum} from '@app/models/reportTypeEnum';
import {TofEmailModal} from '@uni-framework/uni-modal/modals/tof-email-modal/tof-email-modal';

@Injectable()
export class CustomerOrderService extends BizHttp<CustomerOrder> {

    // TODO: To be retrieved from database schema shared.Status instead?
    public statusTypes: Array<any> = [
        { Code: StatusCodeCustomerOrder.Draft, Text: 'Kladd' },
        { Code: StatusCodeCustomerOrder.Registered, Text: 'Registrert' },
        { Code: StatusCodeCustomerOrder.PartlyTransferredToInvoice, Text: 'Delvis overført' },
        { Code: StatusCodeCustomerOrder.TransferredToInvoice, Text: 'Overført' },
        { Code: StatusCodeCustomerOrder.Completed, Text: 'Avsluttet' }
    ];

    public actionOverrides: Array<ITickerActionOverride> = [
        {
            Code: 'order_sendemail',
            ExecuteActionHandler: (selectedRows) => this.onSendEmail(selectedRows)
        },
        {
            Code: 'order_delete',
            ExecuteActionHandler: (selectedRows) => this.deleteOrders(selectedRows)
        },
        {
            Code: 'order_print',
            AfterExecuteActionHandler: (selectedRows) => this.onAfterPrintOrder(selectedRows)
        }
    ];
    public printStatusPrinted: string = '200';

    constructor(
        http: UniHttp,
        private errorService: ErrorService,
        private modalService: UniModalService,
    ) {
        super(http);
        this.relativeURL = CustomerOrder.RelativeUrl;
        this.entityType = CustomerOrder.EntityType;
        this.DefaultOrderBy = null;
    }

    public setPrintStatus(orderId: number, printStatus: string): Observable<any> {
        return super.PutAction(orderId, 'set-customer-order-printstatus', 'ID=' + orderId + '&printStatus=' + printStatus);
    }

    public getStatusText(statusCode: string): string  {
        const statusType = this.statusTypes.find(x => x.Code === statusCode);
        return statusType ? statusType.Text : '';
    }

    public onAfterPrintOrder(selectedRows: Array<any>): Promise<any> {
        return new Promise((resolve, reject) => {
            const order = selectedRows[0];
            this.setPrintStatus(order.ID, this.printStatusPrinted)
                .subscribe((printStatus) => {
                    resolve();
                }, err => {
                    reject(err);
                    this.errorService.handle(err);
                }
                );
        });
    }

    public deleteOrders(selectedRows: Array<any>): Promise<any> {
        const order = selectedRows[0];
        return new Promise((resolve, reject) => {
            this.modalService.confirm({
                header: 'Slette ordre',
                message: 'Vil du slette denne ordren?',
                buttonLabels: {
                    accept: 'Slett',
                    cancel: 'Avbryt'
                }
            }).onClose.subscribe(answer => {
                if (answer === ConfirmActions.ACCEPT) {
                    resolve(
                        this.Remove(order.ID, null).subscribe(
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
                resolve();
            });
        });
    }

    public onSendEmail(selectedRows: Array<any>): Promise<any> {
        const order = selectedRows[0];
        this.modalService.open(TofEmailModal, {
            data: {
                entity: order,
                entityType: 'CustomerOrder',
                reportType: ReportTypeEnum.ORDER
            }
        });

        return Promise.resolve();
    }
}
