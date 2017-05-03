import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../authGuard';
import {CanDeactivateGuard} from '../../canDeactivateGuard';

// module
import {UniTasks} from './tasks';
import {TaskList} from './list/taskList';
import {TaskDetails} from './details/taskDetails';
export const childRoutes = [
    {
        path: '',
        component: TaskList
    },
    {
        path: '',
        component: TaskDetails
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
