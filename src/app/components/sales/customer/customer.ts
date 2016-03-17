import {Component} from "angular2/core";
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, Router, RouteParams} from "angular2/router";

import {TabService} from "../../layout/navbar/tabstrip/tabService";
import {UniTabs} from '../../layout/uniTabs/uniTabs';

import {CustomerDetails} from './customerDetails/customerDetails';
import {CustomerList} from './list/customerList';
import {CustomerAdd} from './add/customerAdd';

const CHILD_ROUTES = [
    {path: '/', redirectTo: ['CustomerList']},
    {path: '/list', component: CustomerList, as: 'CustomerList'},
    {path: '/details/:id', component: CustomerDetails, as: 'CustomerDetails'},
    {path: '/add', component: CustomerAdd, as: 'CustomerAdd'},
    {path: '/next', component: CustomerDetails, as: 'CustomerNext', data: {action: 'next'}},
    {path: '/previous', component: CustomerDetails, as: 'CustomerPrevious', data: {action: 'previous'}},   
]

@Component({
    selector: "customer",
    templateUrl: "app/components/sales/customer/customer.html",
    directives: [ROUTER_DIRECTIVES, UniTabs, CustomerDetails]
})
@RouteConfig(CHILD_ROUTES)
export class Customer {

    childRoutes: RouteDefinition[];
    
    constructor(public router: Router, private tabService: TabService) {
        this.tabService.addTab({name: "Kunder", url: "/customer"});
        this.childRoutes = CHILD_ROUTES.slice(1);     
        

    }
}
