import {Component} from '@angular/core';
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, Router, AsyncRoute} from '@angular/router-deprecated';

import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {UniTabs} from '../../layout/uniTabs/uniTabs';

import {ComponentProxy} from '../../../../framework/core/componentProxy';

const ORDER_ROUTES = [
    new AsyncRoute({
        useAsDefault: true,
        path: '/list',
        name: 'OrderList',
        loader: () => ComponentProxy.LoadComponentAsync('OrderList', 'src/app/components/sales/order/list/orderList')
    }),    
    new AsyncRoute({
        path: '/details/:id',
        name: 'OrderDetails',
        loader: () => ComponentProxy.LoadComponentAsync('OrderDetails', 'src/app/components/sales/order/details/orderDetails')
    })    
];

@Component({
    selector: 'uni-order',
    templateUrl: 'app/components/sales/order/order.html',
    directives: [ROUTER_DIRECTIVES, UniTabs]
})
@RouteConfig(ORDER_ROUTES)
export class Order {

    childRoutes: RouteDefinition[];

    constructor(public router: Router, private tabService: TabService) {
        this.tabService.addTab({name: 'Ordre', url: '/sales/order'});
        this.childRoutes = ORDER_ROUTES;//.slice(0, ORDER_ROUTES.length - 1);
    }
}
