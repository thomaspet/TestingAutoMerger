import {Routes} from '@angular/router';
import {SalaryComponent} from './salary.component';
import {CanDeactivateGuard} from '../../canDeactivateGuard';
import {WageTypeViewComponent} from './wage-type/wage-type-view.component';
import {WageTypeListComponent} from './wage-type/wage-type-list.component';
import {WagetypeSyncGuard} from './wage-type/wage-type-sync.guard';
import {
    AnnualStatementSenderContainerComponent
} from './annual-statement/annual-statement-sender-container/annual-statement-sender-container.component';
import {routes as WageTypeRoutes} from './wage-type/wage-type.routes';
import {CategoryListComponent} from './category/category.component';
import {CategoryViewComponent} from './category/category-view/category-view.component';
import {SalaryTransactionSupplementListComponent} from './salary-transaction-supplement/salary-transaction-supplement-list.component';
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
import { CategoryDetailComponent } from './category/category-details/category-details.component';
import { SalaryBalanceDetailsContainerComponent } from './balance/salary-balance-details-container/salary-balance-details-container.component';
import { IncomeReportsModule } from './income-reports/income-reports.module';

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
        component: WageTypeListComponent,
    },
    {
        path: 'employees',
        loadChildren: () => import('./employee/employee.module').then(m => m.EmployeeModule)
    },
    {
        path: 'payrollrun',
        loadChildren: () => import('./payroll-run/payroll-run.module').then(m => m.PayrollRunModule)
    },
    {
        path: 'amelding',
        loadChildren: () => import('./a-melding/a-melding.module').then(m => m.AMeldingModule)
    },
    {
        path: 'incomereports',
        loadChildren: () => import('./income-reports/income-reports.module').then(m => m.IncomeReportsModule)
    },
    {
        path: 'employeecategories',
        component: CategoryListComponent
    },
    {
        path: 'employeecategories/:id',
        component: CategoryViewComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'details'
            },
            {
                path: 'details',
                component: CategoryDetailComponent
            }
        ],
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'salarybalances',
        component: SalaryBalanceListContainerComponent
    },
    {
        path: 'salarybalances/:id',
        component: BalanceComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'details'
            },
            {
                path: 'details',
                component: SalaryBalanceDetailsContainerComponent
            }
        ],
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
