import { NgModule } from '@angular/core';
import { SalarySharedModule } from '../shared/salary-shared.module';
import { RegulativeDetailsComponent } from './regulative-details/regulative-details.component';
import { RegulativeGroupListComponent } from './regulative-group-list.component';
import { RegulativeService } from './shared/service/regulative.service';
import { RegulativeGroupService } from './shared/service/regulative-group.service';
import { RegulativeDetailsLogicService } from './shared/service/regulative-details-logic.service';

@NgModule({
    imports: [
        SalarySharedModule,
    ],
    declarations: [
        RegulativeDetailsComponent,
        RegulativeGroupListComponent,
    ],
    providers: [
        RegulativeService,
        RegulativeGroupService,
        RegulativeDetailsLogicService,
    ]
  })
  export class RegulativeModule { }
