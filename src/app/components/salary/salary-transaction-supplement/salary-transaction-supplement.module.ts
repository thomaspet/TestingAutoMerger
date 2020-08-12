import { NgModule } from '@angular/core';
import { SalarySharedModule } from '../shared/salary-shared.module';
import { UniSupplementEditModal } from './edit-value-modal.component';
import { SalaryTransactionSupplementListComponent } from './salary-transaction-supplement-list.component';
import { SalaryTransactionSupplementListService } from './shared/service/salary-transaction-supplement-list.service';

@NgModule({
    imports: [
        SalarySharedModule,
    ],
    declarations: [
        UniSupplementEditModal,
        SalaryTransactionSupplementListComponent,
    ],
    providers: [
        SalaryTransactionSupplementListService
    ]
  })
  export class SalaryTransactionSupplementModule { }
