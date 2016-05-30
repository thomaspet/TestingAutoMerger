import {Component} from '@angular/core';
import {RouteConfig, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {ComponentProxy} from '../../../framework/core/componentProxy';
import {AsyncRoute} from '@angular/router-deprecated';
import {UniRouterOutlet} from '../../uniRouterOutlet';

const SALARY_ROUTES = [
    new AsyncRoute({
        path: 'salarytrans',
        name: 'SalaryTransactionSelectionList',
        loader: () => ComponentProxy.LoadComponentAsync('SalaryTransactionSelectionList', 'src/app/components/salary/salarytrans/salarytransactionSelectionList')
    }),
    new AsyncRoute({
        path: '/wagetypes/:id',
        name: 'WageTypeDetail',
        loader: () => ComponentProxy.LoadComponentAsync('WagetypeDetail', 'src/app/components/salary/wagetype/wagetypeDetails')
    }),
    new AsyncRoute({
        path: '/wagetypes',
        name: 'WagetypeList',
        loader: () => ComponentProxy.LoadComponentAsync('WagetypeList', 'src/app/components/salary/wagetype/wagetypeList')
    }),
    new AsyncRoute({
        path: '/employees',
        name: 'EmployeeList',
        useAsDefault: true,
        loader: () => ComponentProxy.LoadComponentAsync('EmployeeList', 'src/app/components/salary/employee/employeeList')
    }),
    new AsyncRoute({
        path: '/employees/:id/...',
        name: 'EmployeeDetails',
        loader: () => ComponentProxy.LoadComponentAsync('EmployeeDetails', 'src/app/components/salary/employee/employeeDetails')
    }),
    new AsyncRoute({
        path: '/payrollrun',
        name: 'PayrollrunList',
        loader: () => ComponentProxy.LoadComponentAsync('PayrollrunList', 'src/app/components/salary/payrollrun/payrollrunList')
    }),
    new AsyncRoute({
        path: '/payrollrun/:id',
        name: 'PayrollrunDetails',
        loader: () => ComponentProxy.LoadComponentAsync('PayrollrunDetails', 'src/app/components/salary/payrollrun/payrollrunDetails')
    }),
    new AsyncRoute({
        path: '/paymentlist/:id',
        name: 'PaymentList',
        loader: () => ComponentProxy.LoadComponentAsync('PaymentList', 'src/app/components/salary/payrollrun/paymentList')
    }),
    
];

@Component({
    selector: 'uni-salary',
    template: '<uni-router-outlet></uni-router-outlet>',
    directives: [ROUTER_DIRECTIVES, UniRouterOutlet]
})
@RouteConfig(SALARY_ROUTES)
export class UniSalary {}

