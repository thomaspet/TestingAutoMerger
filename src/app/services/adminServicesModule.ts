import {NgModule, ModuleWithProviders} from '@angular/core';
import {JobService} from './admin/jobs/jobService';
import {TriggerService} from './admin/jobs/triggerService';
import {ModelService} from './admin/models/modelService';

export * from './reports/reportDefinitionDataSourceService';
export * from './admin/models/modelService';

@NgModule()
export class AdminServicesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: AdminServicesModule,
            providers: [
                JobService,
                TriggerService,
                ModelService
            ]
        };
    }
}
