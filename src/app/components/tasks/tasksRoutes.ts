import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../authGuard';
import {CanDeactivateGuard} from '../../canDeactivateGuard';

// module
import {UniTasks} from './tasks';
import {TaskList} from './list/taskList';

export const childRoutes = [
    {
        path: '',
        component: TaskList
    }
];

const tasksRoutes: Routes = [
    {
        path: 'tasks',
        component: UniTasks,
        canActivate: [AuthGuard],
        children: [{
            path: '',
            canActivateChild: [AuthGuard],
            children: childRoutes
        }],

    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(tasksRoutes);
