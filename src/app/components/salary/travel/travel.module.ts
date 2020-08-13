import { NgModule } from '@angular/core';
import { SalarySharedModule } from '../shared/salary-shared.module';
import { TravelLinesComponent } from './travel-details/travel-lines/travel-lines.component';
import { TravelDetailsComponent } from './travel-details/travel-details.component';
import { TravelFilterComponent } from './travel-filter/travel-filter.component';
import { TravelListComponent } from './travel-list/travel-list.component';
import { TravelRejectModalComponent } from './travel-reject-modal/travel-reject-modal.component';
import { TravelTypeComponent } from './travel-type/travel-type.component';
import { TravelComponent } from './travel.component';
import { TravelLineService } from './shared/service/travel-line.service';
import { TravelTypeService } from './shared/service/travel-type.service';
import { TravelLinesTableService } from './shared/service/travel-lines-table.service';
import { TravelLineTableChangeService } from './shared/service/travel-line-table-change.service';
import { DimensionsColumnsService } from './shared/service/dimensionsColumns/dimensions-columns.service';
import { DimensionsColumnsFieldsService } from './shared/service/dimensionsColumns/logic/dimensions-columns-fields.service';
import { DimensionsColumnsGeneratorService } from './shared/service/dimensionsColumns/logic/dimensions-columns-generator.service';
import { DimensionsColumnsDataService } from './shared/service/dimensionsColumns/logic/dimensions-columns-data.service';

@NgModule({
    imports: [
        SalarySharedModule,
    ],
    declarations: [
        TravelLinesComponent,
        TravelDetailsComponent,
        TravelFilterComponent,
        TravelListComponent,
        TravelRejectModalComponent,
        TravelTypeComponent,
        TravelComponent,
    ],
    providers: [
        TravelLineService,
        TravelTypeService,
        TravelLinesTableService,
        TravelLineTableChangeService,
        DimensionsColumnsService,
        DimensionsColumnsFieldsService,
        DimensionsColumnsGeneratorService,
        DimensionsColumnsDataService,
    ]
  })
export class TravelModule { }
