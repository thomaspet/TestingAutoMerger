import {Routes} from '@angular/router';

import {SalaryComponent} from './salary.component';
import {CanDeactivateGuard} from '../../canDeactivateGuard';

import {WageTypeViewComponent} from './wage-type/wage-type-view.component';
import {WageTypeListComponent} from './wage-type/wage-type-list.component';
import {WagetypeSyncGuard} from './wage-type/wage-type-sync.guard';
import {EmployeeListComponent} from './employee/employee-list.component';
import {EmployeeDetailsComponent} from './employee/employee-details.component';
import {PayrollRunListComponent} from './payroll-run/payroll-run-list.component';
import {PayrollRunDetailsComponent} from './payroll-run/payroll-run-details.component';
import {
    AnnualStatementSenderContainerComponent
} from './annual-statement/annual-statement-sender-container/annual-statement-sender-container.component';
import {routes as EmployeeRoutes} from './employee/employee.routes';
import {routes as WageTypeRoutes} from './wage-type/wage-type.routes';
import {AMeldingViewComponent} from './a-melding/a-melding-view.component';
import {CategoryListComponent} from './category/category-list.component';
import {CategoryViewComponent} from './category/category-view.component';
import {routes as CategoryRoutes} from './category/category.routes';
import {SalaryTransactionSupplementListComponent} from './salary-transaction-supplement/salary-transaction-supplement-list.component';
import {EmployeeGuard} from '@app/components/salary/employee/employee.guard';
import { TravelTypeComponent } from '@app/components/salary/travel/travel-type/travel-type.component';
import {TravelComponent} from '@app/components/salary/travel/travel.component';
import { VariablePayrollsComponent } from './variable-payrolls/variable-payrolls.component';
import {OTPExportComponent} from './otp-export/otp-export.component';
import {RegulativeGroupListComponent} from './regulative/regulative-group-list.component';
import { BalanceComponent } from './balance/balance.component';
import { SalaryBalanceTemplateListComponent } from './salary-balance-template/salary-balance-template-list/salary-balance-template-list.component';
import { SalaryBalanceTemplateViewComponent } from './salary-balance-template/salary-balance-template-view.component';
import { routes as SalarybalanceTemplateRoutes } from './salary-balance-template/salary-balance-template.routes';
import { SalaryBalanceListContainerComponent } from './balance/salary-balance-list-container/salary-balance-list-container.component';
import { routes as SalarybalanceRoutes } from './balance/salary-balance.routes';

export const salaryRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: SalaryComponent
    },
    {
        path: 'wagetypes/:id',
        component: WageTypeViewComponent,
        children: WageTypeRoutes,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [WagetypeSyncGuard],
    },
    {
        path: 'wagetypes',
        component: WageTypeListComponent
    },
    {
        path: 'employees',
        component: EmployeeListComponent
    },
    {
        path: 'employees/:id',
        component: EmployeeDetailsComponent,
        children: EmployeeRoutes,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [EmployeeGuard]
    },
    {
        path: 'payrollrun',
        component: PayrollRunListComponent
    },
    {
        path: 'payrollrun/:id',
        component: PayrollRunDetailsComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [WagetypeSyncGuard],
    },
    {
        path: 'amelding',
        component: AMeldingViewComponent
    },
    {
        path: 'employeecategories',
        component: CategoryListComponent
    },
    {
        path: 'employeecategories/:id',
        component: CategoryViewComponent,
        children: CategoryRoutes,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'salarybalances',
        component: SalaryBalanceListContainerComponent
    },
    {
        path: 'salarybalances/:id',
        component: BalanceComponent,
        children: SalarybalanceRoutes,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'supplements',
        component: SalaryTransactionSupplementListComponent,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'annualstatements',
        component: AnnualStatementSenderContainerComponent
    },
    {
        path: 'traveltypes',
        component: TravelTypeComponent,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'travels',
        component: TravelComponent
    },
    {
        path: 'salarybalancetemplates',
        component: SalaryBalanceTemplateListComponent
    },
    {
        path: 'salarybalancetemplates/:id',
        component: SalaryBalanceTemplateViewComponent,
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
        canActivate: [WagetypeSyncGuard],
    },
    {
        path: 'regulative',
        component: RegulativeGroupListComponent,
    }
];
