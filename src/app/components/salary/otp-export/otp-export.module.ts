import { SalarySharedModule } from '../shared/salary-shared.module';
import { NgModule } from '@angular/core';
import { OTPFilterModalComponent } from './otp-filter-modal/otp-filter-modal.component';
import { OTPPeriodWagetypeModalComponent } from './otp-period-wagetype-modal/otp-period-wagetype-modal.component';
import { OTPExportComponent } from './otp-export.component';
import { OTPExportWageTypeService } from './shared/service/otp-export-wagetype.service';

@NgModule({
    imports: [
        SalarySharedModule,
    ],
    declarations: [
        OTPFilterModalComponent,
        OTPPeriodWagetypeModalComponent,
        OTPExportComponent,
    ],
    providers: [
        OTPExportWageTypeService,
    ]
  })
  export class OTPExportModule { }
