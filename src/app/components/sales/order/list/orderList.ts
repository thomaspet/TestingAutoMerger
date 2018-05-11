import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {CompanySettings} from '../../../../unientities';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {SendEmail} from '../../../../models/sendEmail';
import {ToastService} from '../../../../../framework/uniToast/toastService';
import {UniTickerWrapper} from '../../../uniticker/tickerWrapper/tickerWrapper';
import {
    ITickerActionOverride,
    ITickerColumnOverride
} from '../../../../services/common/uniTickerService';
import {
    CustomerOrderService,
    ReportDefinitionService,
    ErrorService,
    CompanySettingsService,
    EmailService
} from '../../../../services/services';
import {
    UniModalService,
    UniSendEmailModal,
    ConfirmActions
} from '../../../../../framework/uni-modal';
import {IUniSaveAction} from '@uni-framework/save/save';

@Component({
    selector: 'order-list',
    templateUrl: './orderList.html'
})
export class OrderList implements OnInit {
    @ViewChild(UniTickerWrapper) private tickerWrapper: UniTickerWrapper;
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

    public columnOverrides: Array<ITickerColumnOverride> = [
    {
            Field: 'StatusCode',
            Template: (dataItem) => {
                let statusText: string = this.customerOrderService.getStatusText(dataItem.CustomerOrderStatusCode);
                return statusText;
            }
        }
     ];

    public tickercode: string = 'order_list';

    private companySettings: CompanySettings;
    private baseCurrencyCode: string;
    public printStatusPrinted: string = '200';

    public createNewAction: IUniSaveAction = {
        label: 'Ny ordre',
        action: () => this.createOrder()
    };

    constructor(
        private uniHttpService: UniHttp,
        private router: Router,
        private customerOrderService: CustomerOrderService,
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
            url: '/sales/orders',
            name: 'Ordre',
            active: true,
            moduleID: UniModules.Orders
        });
    }

    public createOrder() {
        this.router.navigateByUrl('/sales/orders/0');
    }

    private onAfterPrintOrder(selectedRows: Array<any>): Promise<any> {
        return new Promise((resolve, reject) => {
            let invoice = selectedRows[0];
            this.customerOrderService
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

    private deleteOrders(selectedRows: Array<any>): Promise<any> {
        let order = selectedRows[0];
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
                        this.customerOrderService.Remove(order.ID, null)
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
        let order = selectedRows[0];

        return new Promise((resolve, reject) => {
            let model = new SendEmail();
            model.EntityType = 'CustomerOrder';
            model.EntityID = order.ID;
            model.CustomerID = order.CustomerID;

            const orderNumber = order.OrderNumber ? ` nr. ${order.OrderNumber}` : 'kladd';
            model.Subject = 'Ordre' + orderNumber;
            model.Message = 'Vedlagt finner du ordre' + orderNumber;

            this.modalService.open(UniSendEmailModal, {
                data: model
            }).onClose.subscribe(email => {
                if (email) {
                    this.emailService.sendEmailWithReportAttachment('Ordre id', email);
                }
                resolve();
            });
        });
    }
}
