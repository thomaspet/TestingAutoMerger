import { NgModule } from '@angular/core';
import { SalarySharedModule } from '../shared/salary-shared.module';
import { SalaryTransactionModalComponent } from './salary-transaction-modal.component';
import { VariablePayrollsComponent } from './variable-payrolls.component';

@NgModule({
    imports: [
        SalarySharedModule,
    ],
    declarations: [
        SalaryTransactionModalComponent,
        VariablePayrollsComponent,
    ],
    providers: [

    ]
  })
export class VariablePayrollsModule { }
