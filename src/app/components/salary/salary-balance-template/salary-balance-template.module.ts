import { NgModule } from '@angular/core';
import { SalarySharedModule } from '../shared/salary-shared.module';
import { SalaryBalanceTemplateDetailsComponent } from './salary-balance-template-details/salary-balance-template-details.component';
import { SalaryBalanceTemplateEmployeeListComponent } from './salary-balance-template-employee-list/salary-balance-template-employee-list.component';
import { SalaryBalanceTemplateListComponent } from './salary-balance-template-list/salary-balance-template-list.component';
import { SalaryBalanceTemplateViewComponent } from './salary-balance-template-view.component';

@NgModule({
    imports: [
        SalarySharedModule,
    ],
    declarations: [
        SalaryBalanceTemplateDetailsComponent,
        SalaryBalanceTemplateEmployeeListComponent,
        SalaryBalanceTemplateListComponent,
        SalaryBalanceTemplateViewComponent,
    ],
    providers: [

    ]
  })
  export class SalaryBalanceTemplateModule { }
