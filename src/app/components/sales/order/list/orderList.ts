import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {CustomerOrderService, ITickerColumnOverride, ITickerActionOverride} from '@app/services/services';
import {IUniSaveAction} from '@uni-framework/save/save';

@Component({
    selector: 'order-list',
    templateUrl: './orderList.html'
})
export class OrderList implements OnInit {
    public actionOverrides: ITickerActionOverride[] = this.customerOrderService.actionOverrides;
    public columnOverrides: ITickerColumnOverride[] = [{
        Field: 'StatusCode',
        Template: (dataItem) => {
            const statusText: string = this.customerOrderService.getStatusText(dataItem.CustomerOrderStatusCode);
            return statusText;
        }
    }];

    public tickercode: string = 'order_list';
    public createNewAction: IUniSaveAction = {
        label: 'Ny ordre',
        action: () => this.createOrder()
    };

    constructor(
        private router: Router,
        private customerOrderService: CustomerOrderService,
        private tabService: TabService,
    ) {}

    public ngOnInit() {
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
}
