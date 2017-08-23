import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {CompanySettings} from '../../../../unientities';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {SendEmail} from '../../../../models/sendEmail';
import {ToastService} from '../../../../../framework/uniToast/toastService';
import {
    ITickerActionOverride,
    ITickerColumnOverride
} from '../../../../services/common/uniTickerService';
import {
    CustomerOrderService,
    ReportDefinitionService,
    ErrorService,
    CompanySettingsService,
    ReportService
} from '../../../../services/services';
import {
    UniModalService,
    UniSendEmailModal
} from '../../../../../framework/uniModal/barrel';

@Component({
    selector: 'order-list',
    templateUrl: './orderList.html'
})
export class OrderList implements OnInit {
    private actionOverrides: Array<ITickerActionOverride> = [
        {
            Code: 'order_sendemail',
            ExecuteActionHandler: (selectedRows) => this.onSendEmail(selectedRows)
        }
    ];

    private columnOverrides: Array<ITickerColumnOverride> = [
    {
            Field: 'StatusCode',
            Template: (dataItem) => {
                let statusText: string = this.customerOrderService.getStatusText(dataItem.CustomerOrderStatusCode);
                return statusText;
            }
        }
     ];

    private tickercode: string = 'order_list';

    private companySettings: CompanySettings;
    private baseCurrencyCode: string;
    private printStatusPrinted: string = '200';

    constructor(
        private uniHttpService: UniHttp,
        private router: Router,
        private customerOrderService: CustomerOrderService,
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
            url: '/sales/orders',
            name: 'Ordre',
            active: true,
            moduleID: UniModules.Orders
        });
    }

    public createOrder() {
        this.router.navigateByUrl('/sales/order/0');
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
                    this.reportService.generateReportSendEmail('Ordre id', email);
                }
                resolve();
            });
        });
    }
}
