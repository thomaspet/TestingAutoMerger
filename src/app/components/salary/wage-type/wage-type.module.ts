import { NgModule } from '@angular/core';
import { SalarySharedModule } from '../shared/salary-shared.module';
import { WageTypeDetailsComponent } from './wage-type-details/wage-type-details.component';
import { WageTypeSettingsComponent } from './wage-type-settings/wage-type-settings.component';
import { WageTypeListComponent } from './wage-type-list.component';
import { WageTypeViewComponent } from './wage-type-view.component';
import { IncomeService } from './shared/services/income.service';
import { WageTypeViewService } from './shared/services/wage-type-view.service';
import { WagetypeSyncGuard } from './wage-type-sync.guard';

@NgModule({
    imports: [
        SalarySharedModule,
    ],
    declarations: [
        WageTypeDetailsComponent,
        WageTypeSettingsComponent,
        WageTypeListComponent,
        WageTypeViewComponent,
    ],
    providers: [
        IncomeService,
        WageTypeViewService,
        WagetypeSyncGuard,
    ]
  })
export class WageTypeModule { }
