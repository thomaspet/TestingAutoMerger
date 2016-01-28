import {Component} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {TabService} from '../navbar/tabstrip/tabService';
import {Multival} from '../usertest/multivalue';
import {ApplicationNav} from '../common/applicationNav/applicationNav';
import {PersonalDetails} from '../employee/personalDetails/personalDetails';
import {Employment} from '../employee/employments/employments';
import {Hours} from '../employee/hours/hours';
import {Travel} from '../employee/travel/travel';
import {SalaryTransactions} from '../employee/salaryTransactions/salaryTransactions';
import {RouteConfig, RouteDefinition, RouteParams, ROUTER_DIRECTIVES} from 'angular2/router';

const CHILD_ROUTES = [
    { path: '/', component: PersonalDetails, as: 'Personopplysninger' },
    { path: '/employment', component: Employment, as: 'Stillinger' },
    { path: '/salarytransactions', component: SalaryTransactions, as: 'Lønnsposter' },
    { path: '/hours', component: Hours, as: 'Timer' },
    { path: '/travel', component: Travel, as: 'Reise' },
];

@Component({
    selector: 'uni-usertest',
    templateUrl: 'app/components/usertest/usertest.html',
    directives: [CORE_DIRECTIVES, Multival, ROUTER_DIRECTIVES, ApplicationNav]
})

@RouteConfig(CHILD_ROUTES)

export class Usertest {

    private phone: string[] = ['95529331'];
    private email: string[] = ['j@lom.me', 'jorgen@unimicro.no', 'jl@highlighter.no'];

    childRoutes: RouteDefinition[];

    constructor(private tabService: TabService) {
        this.tabService.addTab({name: 'Usertest', url: '/usertest'});
        this.childRoutes = CHILD_ROUTES;
    }

}
