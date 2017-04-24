import {NgModule, ModuleWithProviders} from '@angular/core';
import {TaskService} from './tasks/taskService';
import {ApprovalService} from './tasks/approvalService';

export * from './tasks/taskService';
export * from './tasks/approvalService';

@NgModule()
export class TaskServicesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: TaskServicesModule,
            providers: [
                TaskService,
                ApprovalService
            ]
        };
    }
}
