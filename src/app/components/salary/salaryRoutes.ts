import {Routes} from '@angular/router';

import {UniSalary} from './salary';
import {CanDeactivateGuard} from '../../canDeactivateGuard';

import {WageTypeView} from './wagetype/wagetypeView';
import {WagetypeList} from './wagetype/wagetypeList';
import {WagetypeSyncGuard} from './wagetype/wagetypesync.guard';
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
import {EmpCanActivateGuard} from '@app/components/salary/employee/empGuard';
import { TraveltypeComponent } from '@app/components/salary/travel/travel-type/traveltype.component';
import {TravelComponent} from '@app/components/salary/travel/travel.component';
import {
    SalarybalanceTemplateListComponent
} from '@app/components/salary/salarybalance/template/salarybalance-template-list/salarybalance-template-list.component';
import { VariablePayrollsComponent } from './variable-payrolls/variable-payrolls.component';
// import {
//     SalarybalanceTemplateDetailsComponent
// } from '@app/components/salary/salarybalance/template/salarybalance-template-details/salarybalance-template-details.component';
import {routes as SalarybalanceTemplateRoutes} from './salarybalance/template/salarybalanceTemplateRoutes';
import {SalarybalanceTemplateView} from './salarybalance/template/salarybalanceTemplateView';
import {OTPExportComponent} from './otpexport/otpexport.component';

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
        canDeactivate: [CanDeactivateGuard],
        canActivate: [WagetypeSyncGuard],
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
        canDeactivate: [CanDeactivateGuard],
        canActivate: [WagetypeSyncGuard],
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
        path: 'traveltypes',
        component: TraveltypeComponent,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'travels',
        component: TravelComponent
    },
    {
        path: 'salarybalancetemplates',
        component: SalarybalanceTemplateListComponent
    },
    {
        path: 'salarybalancetemplates/:id',
        component: SalarybalanceTemplateView,
        children: SalarybalanceTemplateRoutes,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'otpexport',
        component: OTPExportComponent
    },
    {
        path: 'variablepayrolls',
        component: VariablePayrollsComponent,
        canDeactivate: [CanDeactivateGuard],
    },
    {
        path: 'variablepayrolls/:id',
        component: VariablePayrollsComponent,
        canDeactivate: [CanDeactivateGuard],
    },
];
