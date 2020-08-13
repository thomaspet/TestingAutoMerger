import {PersonalDetailsComponent} from './personal-details/personal-details.component';
import {RecurringPostComponent} from './recurring-post/recurring-post.component';
import {EmployeeLeavesComponent} from './employee-leave/employee-leave.component';
import {EmploymentComponent} from './employment/employment.component';
import {EmployeeTaxComponent} from './employee-tax/employee-tax.component';
import {EmployeeTransTickerComponent} from '@app/components/salary/employee/employee-trans-ticker/employee-trans-ticker.component';
import { EmployeeOTPComponent } from './employee-otp/employee-otp.component';
import { SalaryBalanceComponent } from './salary-balance/salary-balance.component';
import { Routes, RouterModule } from '@angular/router';
import { EmployeeListComponent } from './employee-list.component';
import { EmployeeDetailsComponent } from './employee-details.component';
import { CanDeactivateGuard } from '@app/canDeactivateGuard';
import { EmployeeGuard } from './employee.guard';
import { NgModule } from '@angular/core';
import {NewEmployeeGuard} from './new-employee.guard';

const routes: Routes = [
    {
        path: '',
        component: EmployeeListComponent
    },
    {
        path: ':id',
        component: EmployeeDetailsComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'personal-details'
            },
            {
                path: 'personal-details',
                component: PersonalDetailsComponent
            },
            {
                path: 'employments',
                component: EmploymentComponent,
            },
            {
                path: 'recurring-post',
                component: RecurringPostComponent
            },
            {
                path: 'employee-salarybalances',
                component: SalaryBalanceComponent
            },
            {
                path: 'employee-leave',
                component: EmployeeLeavesComponent
            },
            {
                path: 'employee-tax',
                component: EmployeeTaxComponent
            },
            {
                path: 'employee-trans-ticker',
                component: EmployeeTransTickerComponent
            },
            {
                path: 'employee-otp',
                component: EmployeeOTPComponent
            }
        ],
        canDeactivate: [CanDeactivateGuard],
        canActivate: [EmployeeGuard, NewEmployeeGuard]
    }
  ];

  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class EmployeeRoutingModule { }
