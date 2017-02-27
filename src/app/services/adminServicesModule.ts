import {NgModule} from '@angular/core';
import {JobService} from './admin/jobs/jobService';
import {TriggerService} from './admin/jobs/triggerService';

export * from './reports/reportDefinitionDataSourceService';

@NgModule({
    providers: [
        JobService,
        TriggerService
    ]
})
export class AdminServicesModule {}