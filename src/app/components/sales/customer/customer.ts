import {Component} from "angular2/core";
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, Router, RouteParams} from "angular2/router";

import {TabService} from "../../layout/navbar/tabstrip/tabService";
import {UniTabs} from '../../layout/uniTabs/uniTabs';

import {CustomerDetails} from './customerDetails/customerDetails';
import {CustomerSearch} from './search/customerSearch';

const CHILD_ROUTES = [
    {path: '/', redirectTo: ['CustomerSearch']},
    {path: '/search', component: CustomerSearch, as: 'CustomerSearch'},
    {path: '/details', component: CustomerDetails, as: 'CustomerDetails'},
    {path: '/details/:id', component: CustomerDetails, as: 'CustomerDetails'}
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

    ngOnInit() {

    }
}
