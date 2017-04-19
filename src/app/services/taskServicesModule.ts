import {NgModule, ModuleWithProviders} from '@angular/core';
import {TaskService} from './tasks/taskService';

export * from './tasks/taskService';

@NgModule()
export class TaskServicesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: TaskServicesModule,
            providers: [
                TaskService
            ]
        };
    }
}
