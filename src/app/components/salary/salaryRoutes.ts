import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {UniSalary} from './salary';
import {AuthGuard} from '../../authGuard';
import {CanDeactivateGuard} from '../../canDeactivateGuard';

import {WageTypeView} from './wagetype/wagetypeView';
import {WagetypeList} from './wagetype/wagetypeList';
import {EmployeeList} from './employee/employeeList';
import {EmployeeDetails} from './employee/employeeDetails';
import {PayrollrunList} from './payrollrun/payrollrunList';
import {PayrollrunDetails} from './payrollrun/payrollrunDetails';
import {routes as EmployeeRoutes} from './employee/employeeRoutes';
import {routes as WageTypeRoutes} from './wagetype/wagetypeRoutes';
import {AMeldingView} from './amelding/ameldingview';
import {CategoryList} from './category/categoryList';
import {CategoryView} from './category/categoryView';
import {routes as CategoryRoutes} from './category/categoryRoutes';
import {SalarybalanceList} from './salarybalance/salarybalanceList';
import {SalarybalanceView} from './salarybalance/salarybalanceView';
import {routes as SalarybalanceRoutes} from './salarybalance/salarybalanceRoutes';
import {SalaryTransactionSupplementList} from './salaryTransactionSupplement/salaryTransactionSupplementsList';

// Maps entitytype to frontend route
// Important for notifications to work properly!
export const entityTypeMap: any = {
    'wagetype': 'wagetypes/:id',
    'employee': 'employees/:id',
    'payrollrun': 'payrollrun/:id',
    'salarybalance': 'salarybalances/:id'
};

export const childRoutes = [
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
    },
    {
        path: 'salarybalances',
        component: SalarybalanceList
    },
    {
        path: 'salarybalances/:id',
        component: SalarybalanceView,
        children: SalarybalanceRoutes,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'supplements',
        component: SalaryTransactionSupplementList,
        canDeactivate: [CanDeactivateGuard]
    }
];


const salaryRoutes: Routes = [
    {
        path: 'salary',
        component: UniSalary,
        canActivate: [AuthGuard],
        children: [{
            path: '',
            canActivateChild: [AuthGuard],
            children: childRoutes
        }],

    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(salaryRoutes);
