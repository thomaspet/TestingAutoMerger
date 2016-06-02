import {Component} from "@angular/core";
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, Router, AsyncRoute} from "@angular/router-deprecated";
import {TabService} from "../../layout/navbar/tabstrip/tabService";
import {UniTabs} from '../../layout/uniTabs/uniTabs';

import {ProductDetails} from './details/productDetails';
import {ProductList} from './list/productList';

import {ComponentProxy} from "../../../../framework/core/componentProxy";

const CHILD_ROUTES = [
    new AsyncRoute({
        useAsDefault: true, 
        path: '/list',
        name: 'ProductList',
        loader: () => ComponentProxy.LoadComponentAsync("ProductList", "app/components/common/product/list/productList")
    }),
    
    new AsyncRoute({    
        path: '/details/:id',
        name: 'Details',
        loader: () => ComponentProxy.LoadComponentAsync("ProductDetails", "app/components/common/product/details/productDetails")
    })       
]
@Component({
    selector: "product",
    templateUrl: "app/components/common/product/product.html",
    directives: [ROUTER_DIRECTIVES, UniTabs]
})
@RouteConfig(CHILD_ROUTES) 
export class Product {

    childRoutes: RouteDefinition[]; 
    
    constructor(public router: Router, private tabService: TabService) {
        this.tabService.addTab({name: "Produkt", url: "/products"});
        this.childRoutes = CHILD_ROUTES.slice(0, CHILD_ROUTES.length - 1);;    
    }
}