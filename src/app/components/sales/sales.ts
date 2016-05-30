import {Component} from "@angular/core";
import {RouteConfig, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {ComponentProxy} from "../../../framework/core/componentProxy";
import {AsyncRoute} from "@angular/router-deprecated";
import {UniRouterOutlet} from "../../uniRouterOutlet";

const SALES_ROUTES = [
    new AsyncRoute({
        useAsDefault: true,
        path: "/customer/...",
        name: "Customer",
        loader: () => ComponentProxy.LoadComponentAsync("Customer", "src/app/components/sales/customer/customer")
    }),
    new AsyncRoute({        
        path: "/supplier/...",
        name: "Supplier",
        loader: () => ComponentProxy.LoadComponentAsync("Supplier", "src/app/components/sales/supplier/supplier")
    }),
    new AsyncRoute({        
        path: "/quote/...",
        name: "Quote",
        loader: () => ComponentProxy.LoadComponentAsync("Quote", "src/app/components/sales/quote/quote")
    }),
    new AsyncRoute({        
        path: "/invoice/...",
        name: "Invoice",
        loader: () => ComponentProxy.LoadComponentAsync("Invoice", "src/app/components/sales/invoice/invoice")
    }),
    new AsyncRoute({
        path: "/order/...",
        name: "Order",
        loader: () => ComponentProxy.LoadComponentAsync("Order", "src/app/components/sales/order/order")
    })
];

@Component({
    selector: 'uni-sales',
    template: '<uni-router-outlet></uni-router-outlet>',
    directives: [ROUTER_DIRECTIVES, UniRouterOutlet]
})
@RouteConfig(SALES_ROUTES)
export class UniSales {}