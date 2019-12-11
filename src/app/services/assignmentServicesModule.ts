import {NgModule, ModuleWithProviders} from '@angular/core';
import {TaskService} from './assignments/taskService';
import {ApprovalService} from './assignments/approvalService';

export * from './assignments/taskService';
export * from './assignments/approvalService';

@NgModule()
export class AssignmentServicesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: AssignmentServicesModule,
            providers: [
                TaskService,
                ApprovalService,
            ]
        };
    }
}
