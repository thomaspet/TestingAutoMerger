import { NgModule } from '@angular/core';
import { SalarySharedModule } from '../shared/salary-shared.module';
import { WageTypeDetailsComponent } from './wage-type-details/wage-type-details.component';
import { WageTypeSettingsComponent } from './wage-type-settings/wage-type-settings.component';
import { WageTypeListComponent } from './wage-type-list.component';
import { WageTypeViewComponent } from './wage-type-view.component';
import { IncomeService } from './shared/services/income.service';
import { WageTypeViewService } from './shared/services/wage-type-view.service';
import { WagetypeSyncGuard } from './wage-type-sync.guard';
import { WageTypeTranslationService } from './shared/services/wage-type-translation.service';
import { WageTypeEmptyStateComponent } from './wage-type-empty-state/wage-type-empty-state.component';

@NgModule({
    imports: [
        SalarySharedModule,
    ],
    declarations: [
        WageTypeDetailsComponent,
        WageTypeSettingsComponent,
        WageTypeListComponent,
        WageTypeViewComponent,
        WageTypeEmptyStateComponent,
    ],
    providers: [
        IncomeService,
        WageTypeViewService,
        WagetypeSyncGuard,
        WageTypeTranslationService,
    ]
  })
export class WageTypeModule { }
