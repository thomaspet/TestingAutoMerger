import {Component} from '@angular/core';
import {Route, ROUTER_DIRECTIVES, Router} from '@angular/router';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {UniTabs} from '../../layout/uniTabs/uniTabs';

@Component({
    selector: 'uni-customer',
    templateUrl: 'app/components/sales/customer/customer.html',
    directives: [ROUTER_DIRECTIVES, UniTabs]
})
export class Customer {
    private childRoutes: Route[];

    constructor(public router: Router, private tabService: TabService) {
        this.childRoutes = []; // TODO: ROUTES
    }
}
