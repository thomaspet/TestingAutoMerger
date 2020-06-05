import { SalarySharedModule } from '../shared/salary-shared.module';
import { NgModule } from '@angular/core';
import { AnnualStatementSenderComponent } from './annual-statement-sender/annual-statement-sender.component';
import { AnnualStatementSenderContainerComponent } from './annual-statement-sender-container/annual-statement-sender-container.component';
import { AnnualStatementService } from './shared/service/annual-statement.service';

@NgModule({
    imports: [
        SalarySharedModule,
    ],
    declarations: [
        AnnualStatementSenderComponent,
        AnnualStatementSenderContainerComponent,
    ],
    providers: [
        AnnualStatementService,
    ]
  })
  export class AnnualStatementModule { }
