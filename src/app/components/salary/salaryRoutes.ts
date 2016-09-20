import {SalaryTransactionSelectionList} from './salarytrans/salarytransactionSelectionList';
import {WagetypeDetail} from './wagetype/wagetypeDetails';
import {WagetypeList} from './wagetype/wagetypeList';
import {EmployeeList} from './employee/employeeList';
import {EmployeeDetails} from './employee/employeeDetails';
import {PayrollrunList} from './payrollrun/payrollrunList';
import {PayrollrunDetails} from './payrollrun/payrollrunDetails';
import {PaymentList} from './payrollrun/paymentList';
import {routes as EmployeeRoutes} from './employee/employeeRoutes';

import {CanDeactivateGuard} from '../../canDeactivateGuard';

export const routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'employees'
    },
    {
        path: 'wagetypes/:id',
        component: WagetypeDetail
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
        component: PayrollrunDetails
    },
    {
        path: 'paymentlist/:id',
        component: PaymentList
    }
];
