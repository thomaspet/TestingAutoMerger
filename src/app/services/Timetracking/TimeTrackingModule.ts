import {NgModule} from '@angular/core';
import {TimesheetService} from "./timesheetservice";
import {WorkerService} from "./workerService";




@NgModule({
    providers: [
        TimesheetService,
        WorkerService
    ]
})
export class TimeTrackingModule { }
