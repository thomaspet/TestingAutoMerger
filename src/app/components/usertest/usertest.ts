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

    private phone = [];

    private email = [
        {
            id: 0,
            value: 'j@lom.me',
            main: false,

        },
        {
            id: 1,
            value: 'jorgen@unimicro.no',
            main: true
        },
        {
            id: 2,
            value: 'jl@highlighter.no',
            main: false
        }
    ];

    private accounts = [{
        id: 0,
        value: '9484.06.14799',
        main: true
    }];



    childRoutes: RouteDefinition[];

    constructor(private tabService: TabService) {
        this.tabService.addTab({name: 'Usertest', url: '/usertest'});
        this.childRoutes = CHILD_ROUTES;
    }

}
