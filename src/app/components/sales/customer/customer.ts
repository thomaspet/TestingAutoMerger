import {Component} from "@angular/core";
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, Router, AsyncRoute} from "@angular/router-deprecated";

import {TabService} from "../../layout/navbar/tabstrip/tabService";
import {UniTabs} from '../../layout/uniTabs/uniTabs';

import {ComponentProxy} from "../../../../framework/core/componentProxy";

const CUSTOMER_ROUTES = [
    new AsyncRoute({
        useAsDefault: true,
        path: "/list",
        name: "CustomerList",
        loader: () => ComponentProxy.LoadComponentAsync("CustomerList", "./app/components/sales/customer/list/customerList")
    }),
    new AsyncRoute({
        path: "/add",
        name: "CustomerAdd",
        loader: () => ComponentProxy.LoadComponentAsync("CustomerAdd", "./app/components/sales/customer/add/customerAdd")
    }),
    new AsyncRoute({
        path: "/details/:id",
        name: "CustomerDetails",
        loader: () => ComponentProxy.LoadComponentAsync("CustomerDetails", "./app/components/sales/customer/customerDetails/customerDetails")
    })    
];

@Component({
    selector: "uni-customer",
    templateUrl: "app/components/sales/customer/customer.html",
    directives: [ROUTER_DIRECTIVES, UniTabs]
})
@RouteConfig(CUSTOMER_ROUTES)
export class Customer {

    childRoutes: RouteDefinition[];

    constructor(public router: Router, private tabService: TabService) {
        this.tabService.addTab({name: "Kunder", url: "/sales/customer"});
        this.childRoutes = CUSTOMER_ROUTES.slice(0, CUSTOMER_ROUTES.length - 1);
    }
}
