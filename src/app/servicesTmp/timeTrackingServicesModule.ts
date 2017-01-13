import {NgModule} from '@angular/core';
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
export class TimeTrackingServicesModule { }
