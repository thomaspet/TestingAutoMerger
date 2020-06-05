import { NgModule } from '@angular/core';
import { BalanceComponent } from './balance.component';
import { SalaryBalanceLineComponent } from './salary-balance-line/salary-balance-line.component';
import { SalaryBalanceLineModalComponent } from './salary-balance-line-modal/salary-balance-line-modal.component';
import { SalaryBalanceListContainerComponent } from './salary-balance-list-container/salary-balance-list-container.component';
import { SalarySharedModule } from '../shared/salary-shared.module';

@NgModule({
    imports: [
        SalarySharedModule,
    ],
    declarations: [
        BalanceComponent,
        SalaryBalanceLineComponent,
        SalaryBalanceLineModalComponent,
        SalaryBalanceListContainerComponent,
    ],
    providers: [

    ]
  })
  export class BalanceModule { }
