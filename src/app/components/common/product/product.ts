import {Component} from "angular2/core";
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, Router, RouteParams, AsyncRoute} from "angular2/router";

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
        loader: () => ComponentProxy.LoadComponentAsync("ProductList", "./app/components/common/product/list/productList")
    }),
    
    new AsyncRoute({    
        path: '/details/:id',
        name: 'Details',
        loader: () => ComponentProxy.LoadComponentAsync("ProductList", "./app/components/common/product/details/productDetails")
    })/*,
    
    new AsyncRoute({    
        path: '/add',
        name: 'Add',
        loader: () => ComponentProxy.LoadComponentAsync("ProductList", "./app/components/common/product/list/productList")
    }),
    
    new AsyncRoute({    
        path: '/details/next',
        name: 'Next',
        data: {action: 'next'},
        loader: () => ComponentProxy.LoadComponentAsync("ProductList", "./app/components/common/product/details/productDetails")
    }),
    
    new AsyncRoute({    
        path: '/details/previous',
        name: 'Previous',
        data: {action: 'previous'},
        loader: () => ComponentProxy.LoadComponentAsync("ProductList", "./app/components/common/product/details/productDetails")
    }) */
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
        //this.childRoutes = CHILD_ROUTES.slice(1);    
    }
}