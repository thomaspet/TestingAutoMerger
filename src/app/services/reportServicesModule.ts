import {NgModule, ModuleWithProviders} from '@angular/core';
import {ReportDefinitionParameterService} from './reports/reportDefinitionParameterService';
import {ReportDefinitionService} from './reports/reportDefinitionService';
import {ReportService} from './reports/reportService';
import {CampaignTemplateService} from './reports/campaignTemplateService';
import {ReportTypeService} from './reports/reportTypeService';

export * from './reports/reportDefinitionParameterService';
export * from './reports/reportDefinitionService';
export * from './reports/reportService';
export * from './reports/campaignTemplateService';
export * from './reports/reportTypeService';

@NgModule({})
export class ReportServicesModule {
    static forRoot(): ModuleWithProviders<ReportServicesModule> {
        return {
            ngModule: ReportServicesModule,
            providers: [
                ReportDefinitionParameterService,
                ReportDefinitionService,
                ReportService,
                ReportTypeService,
                CampaignTemplateService
            ]
        };
    }
}
