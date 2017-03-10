import {NgModule, ModuleWithProviders} from '@angular/core';
import {TimesheetService} from './timetracking/timesheetService';
import {WorkerService} from './timetracking/workerService';

export * from './timetracking/timesheetService';
export * from './timetracking/workerService';

@NgModule({
    providers: [
        TimesheetService,
        WorkerService
    ]
})
export class TimeTrackingServicesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: TimeTrackingServicesModule,
            providers: [
                TimesheetService,
                WorkerService
            ]
        };
    }
}
