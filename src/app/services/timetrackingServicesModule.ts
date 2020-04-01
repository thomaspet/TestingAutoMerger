import {NgModule, ModuleWithProviders} from '@angular/core';
import {TimesheetService} from './timetracking/timesheetService';
import {WorkerService} from './timetracking/workerService';
import {InvoiceHourService} from './timetracking/invoice-hours.service';

export * from './timetracking/timesheetService';
export * from './timetracking/workerService';
export * from './timetracking/invoice-hours.service';

@NgModule({
    providers: [
        TimesheetService,
        WorkerService,
        InvoiceHourService
    ]
})
export class TimeTrackingServicesModule {
    static forRoot(): ModuleWithProviders<TimeTrackingServicesModule> {
        return {
            ngModule: TimeTrackingServicesModule,
            providers: [
                TimesheetService,
                WorkerService,
                InvoiceHourService
            ]
        };
    }
}
