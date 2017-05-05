import {Component, ViewChild, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {CompanySettings} from '../../../../unientities';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {SendEmailModal} from '../../../common/modals/sendEmailModal';
import {SendEmail} from '../../../../models/sendEmail';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {ITickerActionOverride, TickerAction, ITickerColumnOverride} from '../../../../services/common/uniTickerService';
import * as moment from 'moment';
import {
    CustomerOrderService,
    ReportDefinitionService,
    ErrorService,
    CompanySettingsService,
    ReportService
} from '../../../../services/services';

@Component({
    selector: 'order-list',
    templateUrl: './orderList.html'
})
export class OrderList implements OnInit {
    @ViewChild(SendEmailModal) private sendEmailModal: SendEmailModal;

    private actionOverrides: Array<ITickerActionOverride> = [

        {
            Code: 'order_print',
            AfterExecuteActionHandler: (selectedRows) => this.onAfterPrintOrder(selectedRows)
        },
        {
            Code: 'order_sendemail',
            ExecuteActionHandler: (selectedRows) => this.onSendEmail(selectedRows)
        }
    ];

    private columnOverrides: Array<ITickerColumnOverride> = [ ];

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
            let sendemail = new SendEmail();
            sendemail.EntityType = 'CustomerOrder';
            sendemail.EntityID = order.ID;
            sendemail.CustomerID = order.CustomerID;
            sendemail.Subject = 'Ordre ' + (order.CustomerOrderNumber ? 'nr. ' + order.CustomerOrderOrderNumber : 'kladd');
            sendemail.Message = 'Vedlagt finner du Ordre ' + (order.CustomerOrderOrderNumber ? 'nr. ' + order.CustomerOrderOrderNumber : 'kladd');

            this.sendEmailModal.openModal(sendemail);

            if (this.sendEmailModal.Changed.observers.length === 0) {
                this.sendEmailModal.Changed.subscribe((email) => {
                    this.reportService.generateReportSendEmail('Ordre id', email);
                    resolve();
                });
            }
        });
    }

    private onAfterPrintOrder(selectedRows: Array<any>): Promise<any> {
        return new Promise((resolve, reject) => {
            let order = selectedRows[0];
            this.customerOrderService
                .setPrintStatus(order.ID, this.printStatusPrinted)
                    .subscribe((printStatus) => {
                        resolve();
                    }, err => {
                        reject(err);
                        this.errorService.handle(err);
                    }
                );
        });
    }


}
