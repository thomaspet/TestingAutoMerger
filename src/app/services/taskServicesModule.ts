import {NgModule, ModuleWithProviders} from '@angular/core';
import {TaskService} from './tasks/taskService';
import {ApprovalService} from './tasks/approvalService';
import {ThresholdService} from './tasks/thresholdService';

export * from './tasks/taskService';
export * from './tasks/approvalService';
export * from './tasks/thresholdService';

@NgModule()
export class TaskServicesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: TaskServicesModule,
            providers: [
                TaskService,
                ApprovalService,
                ThresholdService
            ]
        };
    }
}
