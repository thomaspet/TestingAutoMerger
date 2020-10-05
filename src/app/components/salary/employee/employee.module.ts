import { SalarySharedModule } from '../shared/salary-shared.module';
import { NgModule } from '@angular/core';
import { EmployeeLeavesComponent } from './employee-leave/employee-leave.component';
import { EmployeeOTPComponent } from './employee-otp/employee-otp.component';
import { EmployeeTaxComponent } from './employee-tax/employee-tax.component';
import { EmployeeTransTickerComponent } from './employee-trans-ticker/employee-trans-ticker.component';
import { EmploymentComponent } from './employment/employment.component';
import { EmployeeListComponent } from './employee-list.component';
import { EmployeeDetailsComponent } from './employee-details.component';
import { EmploymentDetailsComponent } from './employment/employment.details.component';
import { PersonalDetailsComponent } from './personal-details/personal-details.component';
import { RecurringPostComponent } from './recurring-post/recurring-post.component';
import { EmployeeDetailsService } from './shared/services/employee-details.service';
import { EmployeeLeaveService } from './shared/services/employee-leave.service';
import { SalaryBalanceComponent } from './salary-balance/salary-balance.component';
import { EmployeeGuard } from './employee.guard';
import { EmployeeRoutingModule } from './employee-routing.module';
import { NewEmployeeGuard } from './new-employee.guard';
import { FirstEmployeeGuard } from './first-employee.guard';

@NgModule({
    imports: [
        SalarySharedModule,
        EmployeeRoutingModule,
    ],
    declarations: [
        EmployeeLeavesComponent,
        EmployeeOTPComponent,
        EmployeeTaxComponent,
        EmployeeTransTickerComponent,
        EmploymentComponent,
        EmployeeListComponent,
        EmployeeDetailsComponent,
        EmploymentDetailsComponent,
        PersonalDetailsComponent,
        RecurringPostComponent,
        SalaryBalanceComponent,
    ],
    providers: [
        EmployeeDetailsService,
        EmployeeLeaveService,
        EmployeeGuard,
        NewEmployeeGuard,
        FirstEmployeeGuard,
    ]
  })
  export class EmployeeModule { }
