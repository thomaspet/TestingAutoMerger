import {NgModule} from '@angular/core';
import {ReportDefinitionDataSourceService} from './ReportDefinitionDataSourceService';
import {ReportDefinitionParameterService} from './ReportDefinitionParameterService';
import {ReportDefinitionService} from './ReportDefinitionService';

@NgModule({
    providers: [
        ReportDefinitionDataSourceService,
        ReportDefinitionParameterService,
        ReportDefinitionService
    ]
})
export class ReportServicesModule {}
