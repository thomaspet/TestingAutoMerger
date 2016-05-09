import {Component} from '@angular/core';
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, Router, AsyncRoute} from '@angular/router-deprecated';

import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {UniTabs} from '../../layout/uniTabs/uniTabs';

import {ComponentProxy} from '../../../../framework/core/componentProxy';

const ORDER_ROUTES = [
    new AsyncRoute({
        useAsDefault: true,
        path: '/list',
        name: 'InvoiceList',
        loader: () => ComponentProxy.LoadComponentAsync('InvoiceList', './app/components/sales/invoice/list/invoiceList')
    }),    
    new AsyncRoute({
        path: '/details/:id',
        name: 'InvoiceDetails',
        loader: () => ComponentProxy.LoadComponentAsync('InvoiceDetails', './app/components/sales/invoice/details/invoiceDetails')
    })    
];

@Component({
    selector: 'uni-invoice',
    templateUrl: 'app/components/sales/invoice/invoice.html',
    directives: [ROUTER_DIRECTIVES, UniTabs]
})
@RouteConfig(ORDER_ROUTES)
export class Invoice {

    childRoutes: RouteDefinition[];

    constructor(public router: Router, private tabService: TabService) {
        this.tabService.addTab({name: 'Faktura', url: '/sales/invoice'});
        this.childRoutes = ORDER_ROUTES;//.slice(0, ORDER_ROUTES.length - 1);
    }
}
