import {Component, provide} from 'angular2/core';
import {RouteConfig, RouteDefinition, RouteParams, ROUTER_DIRECTIVES, AsyncRoute} from 'angular2/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import {UniTabs} from '../../layout/uniTabs/uniTabs';
import {WidgetPoster} from '../../../../framework/widgetPoster/widgetPoster';


import {EmployeeDS} from '../../../data/employee';
import {STYRKCodesDS} from '../../../data/styrkCodes';
import {ComponentProxy} from '../../../../framework/core/componentProxy';

const CHILD_ROUTES = [
    new AsyncRoute({
        useAsDefault: true,
        path: '/personal-details',
        name: 'Detaljer',
        loader: () => ComponentProxy.LoadComponentAsync('PersonalDetails', './app/components/salary/employee/personalDetails/personalDetails')
    }),
    new AsyncRoute({
        path: '/employment',
        name: 'Employment',
        loader: () => ComponentProxy.LoadComponentAsync('EmployeeEmployment', './app/components/salary/employee/employments/employments')
    }),
    new AsyncRoute({
        path: '/salarytrans',
        name: 'Lønnstranser',
        loader: () => ComponentProxy.LoadComponentAsync('SalaryTransactionEmployeeList', './app/components/salary/salarytrans/salarytransList')
    }),
    new AsyncRoute({
        path: '/hours',
        name: 'Hours',
        loader: () => ComponentProxy.LoadComponentAsync('Hours', './app/components/salary/employee/hours/hours')
    }),
    new AsyncRoute({
        path: '/travel',
        name: 'Travel',
        loader: () => ComponentProxy.LoadComponentAsync('Travel', './app/components/salary/employee/travel/travel')
    }),
    new AsyncRoute({
        path: '/employeeleave',
        name: 'EmployeeLeave',
        loader: () => ComponentProxy.LoadComponentAsync('EmployeeLeave', './app/components/salary/employee/employeeLeave/employeeLeave')
    })
];

@Component({
    selector: 'uni-employee-details',
    templateUrl: 'app/components/salary/employee/employeeDetails.html',
    providers: [provide(EmployeeDS, {useClass: EmployeeDS}), provide(STYRKCodesDS, {useClass: STYRKCodesDS})],
    directives: [ROUTER_DIRECTIVES, WidgetPoster, UniTabs]
})

@RouteConfig(CHILD_ROUTES)
export class EmployeeDetails {
    employee; // any = {};
    // empJSON;
    childRoutes: RouteDefinition[];
    subEntities;

    constructor(private routeParams: RouteParams, private employeeDS: EmployeeDS) {
        this.childRoutes = CHILD_ROUTES;
    }

    ngOnInit() {
        var employeeID = this.routeParams.get('id');
        Observable.forkJoin(
            this.employeeDS.get(employeeID),
            this.employeeDS.getSubEntities()
        ).subscribe((response: any) => {
            let [emp, loc] = response;
            this.employee = emp;
            this.subEntities = loc;

            //console.log('employee', response);
            
        }, error => console.log(error));
    }

    onFormSubmit(value) {
        console.log(value);
    }

}