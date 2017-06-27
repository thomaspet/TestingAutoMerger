import {NgModule, ModuleWithProviders} from '@angular/core';
import {TaskService} from './assignments/taskService';
import {ApprovalService} from './assignments/approvalService';
import {ThresholdService} from './assignments/thresholdService';

export * from './assignments/taskService';
export * from './assignments/approvalService';
export * from './assignments/thresholdService';

@NgModule()
export class AssignmentServicesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: AssignmentServicesModule,
            providers: [
                TaskService,
                ApprovalService,
                ThresholdService
            ]
        };
    }
}
