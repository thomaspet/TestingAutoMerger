import {Routes} from '@angular/router';

import {UniSalary} from './salary';
import {CanDeactivateGuard} from '../../canDeactivateGuard';

import {WageTypeView} from './wagetype/wagetypeView';
import {WagetypeList} from './wagetype/wagetypeList';
import {EmployeeList} from './employee/employeeList';
import {EmployeeDetails} from './employee/employeeDetails';
import {PayrollrunList} from './payrollrun/payrollrunList';
import {PayrollrunDetails} from './payrollrun/payrollrunDetails';
import {
    AnnualStatementSenderContainerComponent
} from './annualStatement/annual-statement-sender-container/annual-statement-sender-container.component';
import {routes as EmployeeRoutes} from './employee/employeeRoutes';
import {routes as WageTypeRoutes} from './wagetype/wagetypeRoutes';
import {AMeldingView} from './amelding/ameldingview';
import {CategoryList} from './category/categoryList';
import {CategoryView} from './category/categoryView';
import {routes as CategoryRoutes} from './category/categoryRoutes';
import {SalaryBalanceListContainer} from './salarybalance/salaryBalanceList/salaryBalanceListContainer';
import {SalarybalanceView} from './salarybalance/salarybalanceView';
import {routes as SalarybalanceRoutes} from './salarybalance/salarybalanceRoutes';
import {SalaryTransactionSupplementList} from './salaryTransactionSupplement/salaryTransactionSupplementsList';
import {AltinnOverviewComponent} from './altinnOverview/altinn-overview/altinn-overview.component';
import {EmpCanActivateGuard} from '@app/components/salary/employee/empGuard';
import {TravelComponent} from '@app/components/salary/travel/travel.component';

export const salaryRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: UniSalary
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
        canDeactivate: [CanDeactivateGuard],
        canActivate: [EmpCanActivateGuard]
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
        component: SalaryBalanceListContainer
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
    },
    {
        path: 'annualstatements',
        component: AnnualStatementSenderContainerComponent
    },
    {
        path: 'altinnoverview',
        component: AltinnOverviewComponent
    },
    {
        path: 'travels',
        component: TravelComponent
    }
];
