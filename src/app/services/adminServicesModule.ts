import {NgModule, ModuleWithProviders} from '@angular/core';
import {JobService} from './admin/jobs/jobService';
import {ModelService} from './admin/models/modelService';

export * from './admin/jobs/jobService';
export * from './admin/models/modelService';

@NgModule()
export class AdminServicesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: AdminServicesModule,
            providers: [
                JobService,
                ModelService
            ]
        };
    }
}
