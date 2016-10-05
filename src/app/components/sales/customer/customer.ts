import {Component} from '@angular/core';
import {Route, Router} from '@angular/router';
import {TabService} from '../../layout/navbar/tabstrip/tabService';


@Component({
    selector: 'uni-customer',
    templateUrl: 'app/components/sales/customer/customer.html'
})
export class Customer {
    private childRoutes: Route[];

    constructor(public router: Router, private tabService: TabService) {
        this.childRoutes = []; // TODO: ROUTES
    }
}
