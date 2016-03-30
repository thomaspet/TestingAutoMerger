import {Component} from "angular2/core";
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, Router, RouteParams} from "angular2/router";

import {TabService} from "../../layout/navbar/tabstrip/tabService";
import {UniTabs} from '../../layout/uniTabs/uniTabs';

import {ProductDetails} from './details/productDetails';
import {ProductList} from './list/productList';

const CHILD_ROUTES = [
    {path: '/', redirectTo: ['ProductList']},
    {path: '/add', component: ProductList, as: 'Add'},
    {path: '/list', component: ProductList, as: 'ProductList'},    
    {path: '/details/:id', component: ProductDetails, as: 'Details'},    
    {path: '/next', component: ProductDetails, as: 'Next', data: {action: 'next'}},
    {path: '/previous', component: ProductDetails, as: 'Previous', data: {action: 'previous'}}  
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
        this.childRoutes = CHILD_ROUTES.slice(1);    
    }
}