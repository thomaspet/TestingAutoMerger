import {Component} from "angular2/core";
import {RouteConfig, ROUTER_DIRECTIVES} from "angular2/router";
import {ComponentProxy} from "../../../framework/core/componentProxy";
import {AsyncRoute} from "angular2/router";
import {UniRouterOutlet} from "../../uniRouterOutlet";

const SALES_ROUTES = [
    new AsyncRoute({
        useAsDefault: true,
        path: "/customer/...",
        name: "Customer",
        loader: () => ComponentProxy.LoadComponentAsync("Customer", "./app/components/sales/customer/customer")
    }),
    new AsyncRoute({        
        path: "/supplier/...",
        name: "Supplier",
        loader: () => ComponentProxy.LoadComponentAsync("Supplier", "./app/components/sales/supplier/supplier")
    }),
    new AsyncRoute({        
        path: "/quote/...",
        name: "Quote",
        loader: () => ComponentProxy.LoadComponentAsync("Quote", "./app/components/sales/quote/quote")
    })
];

@Component({
    selector: 'uni-sales',
    template: '<uni-router-outlet></uni-router-outlet>',
    directives: [ROUTER_DIRECTIVES, UniRouterOutlet]
})
@RouteConfig(SALES_ROUTES)
export class UniSales {}