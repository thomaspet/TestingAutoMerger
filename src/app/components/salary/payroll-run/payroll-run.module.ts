import { NgModule } from '@angular/core';
import { SalarySharedModule } from '../shared/salary-shared.module';
import { TimeTransferComponent } from './modals/time-transfer/time-transfer.component';
import { ControlModalComponent } from './modals/control-modal.component';
import { PostingSummaryModalComponent } from './modals/posting-summary-modal.component';
import { NegativeSalaryComponent } from './negative-salary/negative-salary.component';
import { NegativeSalaryModalComponent } from './negative-salary/negative-salary-modal/negative-salary-modal.component';
import { UniFindEmployeeModalComponent } from './salary-transaction/find-employee-modal.component';
import { SalaryTransactionListComponent } from './salary-transaction/salary-transaction-list.component';
import { SalaryTransactionSelectionListComponent } from './salary-transaction/salary-transaction-selection-list.component';
import { PaycheckMailOptionsComponent } from './sending/paycheck-mail-options/paycheck-mail-options.component';
import { PaycheckSenderModalComponent } from './sending/paycheck-sender-modal.component';
import { PaycheckSendingComponent } from './sending/paycheck-sending.component';
import { PayrollRunDetailsComponent } from './payroll-run-details/payroll-run-details.component';
import { PayrollRunListComponent } from './payroll-run.component';
import { PayrollRunDetailsService } from './services/payroll-run-details.service';
import { PayrollRunDataService } from './services/payroll-run-data.service';
import { SalaryHelperMethodsService } from './services/salary-helper-methods.service';
import { PayrollRunRoutingModule } from './payroll-run-routing.module';
import { SalaryTransactionChangeService } from './services/salary-transaction-change.service';
import { PayrollRunLayoutService } from './services/payroll-run-layout.service';

@NgModule({
    imports: [
        SalarySharedModule,
        PayrollRunRoutingModule,
    ],
    declarations: [
        TimeTransferComponent,
        ControlModalComponent,
        PostingSummaryModalComponent,
        NegativeSalaryComponent,
        NegativeSalaryModalComponent,
        UniFindEmployeeModalComponent,
        SalaryTransactionListComponent,
        SalaryTransactionSelectionListComponent,
        PaycheckMailOptionsComponent,
        PaycheckSenderModalComponent,
        PaycheckSendingComponent,
        PayrollRunDetailsComponent,
        PayrollRunListComponent,
    ],
    providers: [
        PayrollRunDetailsService,
        PayrollRunDataService,
        SalaryHelperMethodsService,
        SalaryTransactionChangeService,
        PayrollRunLayoutService,
    ]
  })
  export class PayrollRunModule { }
