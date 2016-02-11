import {Component} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {TabService} from '../layout/navbar/tabstrip/tabService';
import {Multival} from '../usertest/multivalue';
import {UniTabs} from '../layout/uniTabs/uniTabs';
import {PersonalDetails} from '../salary/employee/personalDetails/personalDetails';
import {Employment} from '../salary/employee/employments/employments';
import {Hours} from '../salary/employee/hours/hours';
import {Travel} from '../salary/employee/travel/travel';
import {SalaryTransactions} from '../salary/employee/salaryTransactions/salaryTransactions';
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
    directives: [CORE_DIRECTIVES, Multival, ROUTER_DIRECTIVES, UniTabs]
})



@RouteConfig(CHILD_ROUTES)

export class Usertest {

    private phone = [
        {
            id: 0,
            value: '+47 55543265',
            main: true
        },{
            id: 1,
            value: '+47 95529331',
            main: false
        }];

    private email = [
        {
            id: 0,
            value: 'audhild@unimicro.no',
            main: false,

        },
        {
            id: 1,
            value: 'audhild.grieg@gmail.com',
            main: true
        },
        {
            id: 2,
            value: 'nsync4eva@hotmail.com',
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
