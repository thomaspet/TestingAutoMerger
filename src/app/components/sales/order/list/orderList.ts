import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {CompanySettings} from '../../../../unientities';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {UniTickerWrapper} from '../../../uniticker/tickerWrapper/tickerWrapper';
import {
    ITickerActionOverride,
    ITickerColumnOverride
} from '../../../../services/common/uniTickerService';
import {
    CustomerOrderService,
    ErrorService,
    CompanySettingsService,
} from '../../../../services/services';
import {IUniSaveAction} from '@uni-framework/save/save';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { UniModalService } from '@uni-framework/uni-modal';
import { ToastService } from '@uni-framework/uniToast/toastService';
import { BatchInvoiceModal } from '../../common/batchInvoiceModal/batchInvoiceModal';
import { StatisticsService } from '@app/services/common/statisticsService';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

@Component({
    selector: 'order-list',
    templateUrl: './orderList.html'
})
export class OrderList implements OnInit {
    @ViewChild(UniTickerWrapper) private tickerWrapper: UniTickerWrapper;
    public actionOverrides: Array<ITickerActionOverride> = this.customerOrderService.actionOverrides;

    public columnOverrides: Array<ITickerColumnOverride> = [
    {
            Field: 'StatusCode',
            Template: (dataItem) => {
                const statusText: string = this.customerOrderService.getStatusText(dataItem.CustomerOrderStatusCode);
                return statusText;
            }
        }
     ];

     public toolbarconfig: IToolbarConfig = {
        title: 'Ordre',
         contextmenu: [
            {
                label: 'Samlefaktura',
                action: () => this.openBatchInvoiceModal()
            }
        ]
    };

    public tickercode: string = 'order_list';

    private companySettings: CompanySettings;
    private baseCurrencyCode: string;

    public createNewAction: IUniSaveAction = {
        label: 'Ny ordre',
        action: () => this.createOrder()
    };

    constructor(
        private uniHttpService: UniHttp,
        private router: Router,
        private customerOrderService: CustomerOrderService,
        private tabService: TabService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private modalService: UniModalService,
        private toastService: ToastService,
        private statisticsService: StatisticsService
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

    private openBatchInvoiceModal() {
        const mainTicker = this.tickerWrapper.tickerContainer.mainTicker;
        if (!mainTicker) {
            return;
        }
        const params = mainTicker.lastFilterParams;
        if (!params) {
            return;
        }
        let newParams = params.delete('top').delete('skip').delete('limit');
        let selectQuery = newParams.get('select');
        if (selectQuery.indexOf('CustomerOrderTaxInclusiveAmountCurrency') === -1 ) {
            selectQuery += ',CustomerOrder.TaxInclusiveAmountCurrency as CustomerOrderTaxInclusiveAmountCurrency';
        }
        newParams = newParams.set('select', selectQuery);
        this.statisticsService
            .GetAllByHttpParams(newParams, mainTicker.ticker.Distinct || false)
            .pipe(
                map(response => response.body.Data)
            )
            .subscribe(data => {
                this.modalService.open(BatchInvoiceModal, { data: {
                    entityType: 'order',
                    items: data
                }}).onClose.subscribe(close => {
                    if (close === 'ok') {
                        this.toastService.addToast('Jobbkjøring vellykket');
                    }
                });
            });
    }
}
