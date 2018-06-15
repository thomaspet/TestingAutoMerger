import {NgModule, ModuleWithProviders} from '@angular/core';
import {ReportDefinitionDataSourceService} from './reports/reportDefinitionDataSourceService';
import {ReportDefinitionParameterService} from './reports/reportDefinitionParameterService';
import {ReportDefinitionService} from './reports/reportDefinitionService';
import {ReportService} from './reports/reportService';
import {CampaignTemplateService} from './reports/campaignTemplateService';
import {ReportTypeService} from './reports/reportTypeService';

export * from './reports/reportDefinitionDataSourceService';
export * from './reports/reportDefinitionParameterService';
export * from './reports/reportDefinitionService';
export * from './reports/reportService';
export * from './reports/campaignTemplateService';
export * from './reports/reportTypeService';

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
                ReportService,
                ReportTypeService,
                CampaignTemplateService
            ]
        };
    }
}
