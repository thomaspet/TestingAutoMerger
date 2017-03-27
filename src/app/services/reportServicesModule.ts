import {NgModule, ModuleWithProviders} from '@angular/core';
import {ReportDefinitionDataSourceService} from './reports/reportDefinitionDataSourceService';
import {ReportDefinitionParameterService} from './reports/reportDefinitionParameterService';
import {ReportDefinitionService} from './reports/reportDefinitionService';
import {ReportService} from './reports/reportService';

export * from './reports/reportDefinitionDataSourceService';
export * from './reports/reportDefinitionParameterService';
export * from './reports/reportDefinitionService';
export * from './reports/reportService';

@NgModule({
    // providers: [
    //     ReportDefinitionDataSourceService,
    //     ReportDefinitionParameterService,
    //     ReportDefinitionService
    // ]
})
export class ReportServicesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: ReportServicesModule,
            providers: [
                ReportDefinitionDataSourceService,
                ReportDefinitionParameterService,
                ReportDefinitionService,
                ReportService
            ]
        };
    }
}
