import {NgModule} from '@angular/core';
import {ReportDefinitionDataSourceService} from './reports/reportDefinitionDataSourceService';
import {ReportDefinitionParameterService} from './reports/reportDefinitionParameterService';
import {ReportDefinitionService} from './reports/reportDefinitionService';

export * from './reports/reportDefinitionDataSourceService';
export * from './reports/reportDefinitionParameterService';
export * from './reports/reportDefinitionService';

@NgModule({
    providers: [
        ReportDefinitionDataSourceService,
        ReportDefinitionParameterService,
        ReportDefinitionService
    ]
})
export class ReportServicesModule {}
