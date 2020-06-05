import { NgModule } from '@angular/core';
import { SalarySharedModule } from '../shared/salary-shared.module';
import { UniSupplementEditModal } from './edit-value-modal.component';
import { SalaryTransactionSupplementListComponent } from './salary-transaction-supplement-list.component';

@NgModule({
    imports: [
        SalarySharedModule,
    ],
    declarations: [
        UniSupplementEditModal,
        SalaryTransactionSupplementListComponent,
    ],
    providers: [

    ]
  })
  export class SalaryTransactionSupplementModule { }
