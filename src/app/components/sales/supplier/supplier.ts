import {Component} from "angular2/core";
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, Router, AsyncRoute} from "angular2/router";

import {TabService} from "../../layout/navbar/tabstrip/tabService";
import {UniTabs} from '../../layout/uniTabs/uniTabs';

import {ComponentProxy} from "../../../../framework/core/componentProxy";

const SUPPLIER_ROUTES = [
    new AsyncRoute({
        useAsDefault: true,
        path: "/list",
        name: "SupplierList",
        loader: () => ComponentProxy.LoadComponentAsync("SupplierList", "./app/components/sales/supplier/list/supplierList")
    }),    
    new AsyncRoute({
        path: "/details/:id",
        name: "SupplierDetails",
        loader: () => ComponentProxy.LoadComponentAsync("SupplierDetails", "./app/components/sales/supplier/details/supplierDetails")
    })    
];

@Component({
    selector: "uni-supplier",
    templateUrl: "app/components/sales/supplier/supplier.html",
    directives: [ROUTER_DIRECTIVES, UniTabs]
})
@RouteConfig(SUPPLIER_ROUTES)
export class Supplier {

    childRoutes: RouteDefinition[];

    constructor(public router: Router, private tabService: TabService) {
        this.tabService.addTab({name: "Leverandører", url: "/sales/supplier"});
        this.childRoutes = SUPPLIER_ROUTES.slice(0, SUPPLIER_ROUTES.length - 1);
    }
}
