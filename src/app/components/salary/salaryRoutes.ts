import {Routes} from '@angular/router';

import {UniSalary} from './salary';
import {AuthGuard} from '../../authGuard';
import {CanDeactivateGuard} from '../../canDeactivateGuard';

import {WageTypeView} from './wagetype/wagetypeView';
import {WagetypeList} from './wagetype/wagetypeList';
import {EmployeeList} from './employee/employeeList';
import {EmployeeDetails} from './employee/employeeDetails';
import {PayrollrunList} from './payrollrun/payrollrunList';
import {PayrollrunDetails} from './payrollrun/payrollrunDetails';
import {PaymentList} from './payrollrun/paymentList';
import {routes as EmployeeRoutes} from './employee/employeeRoutes';
import {routes as WageTypeRoutes} from './wagetype/wagetypeRoutes';
import {AMeldingView} from './amelding/ameldingview';
import {CategoryList} from './category/categoryList';
import {CategoryView} from './category/categoryView';
import {routes as CategoryRoutes} from './category/categoryRoutes';

// Maps entitytype to frontend route
// Important for notifications to work properly!
export const entityTypeMap: any = {
    'wagetype': 'wagetypes/:id',
    'employee': 'employees/:id',
    'payrollrun': 'payrollrun/:id'
};

export const salaryRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'employees'
    },
    {
        path: 'wagetypes/:id',
        component: WageTypeView,
        children: WageTypeRoutes,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'wagetypes',
        component: WagetypeList
    },
    {
        path: 'employees',
        component: EmployeeList
    },
    {
        path: 'employees/:id',
        component: EmployeeDetails,
        children: EmployeeRoutes,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'payrollrun',
        component: PayrollrunList
    },
    {
        path: 'payrollrun/:id',
        component: PayrollrunDetails,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'paymentlist/:id',
        component: PaymentList
    },
    {
        path: 'amelding',
        component: AMeldingView
    },
    {
        path: 'employeecategories',
        component: CategoryList
    },
    {
        path: 'employeecategories/:id',
        component: CategoryView,
        children: CategoryRoutes,
        canDeactivate: [CanDeactivateGuard]
    }
];


// export const salaryRoutes: Routes = [
//     {
//         path: 'salary',
//         component: UniSalary,
//         canActivate: [AuthGuard],
//         children: [{
//             path: '',
//             canActivateChild: [AuthGuard],
//             children: childRoutes
//         }],

//     }
// ];

// @NgModule({
//     imports: [RouterModule.forChild(routes)],
//     exports: [RouterModule]
// })
// export const salaryRoutes: ModuleWithProviders = RouterModule.forChild(routes);
