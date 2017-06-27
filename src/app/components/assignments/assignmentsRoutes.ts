import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../authGuard';
import {CanDeactivateGuard} from '../../canDeactivateGuard';

import {UniAssignments} from './assignments';
import {UniTasks} from './tasks/tasks';
import {UniApprovals} from './approvals/approvals';

const tasksRoutes: Routes = [
    {
        path: 'assignments',
        component: UniAssignments,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'approvals'
            },
            {
                path: 'tasks',
                component: UniTasks,
                canActivate: [AuthGuard],
            },
            {
                path: 'tasks/:id',
                component: UniTasks,
                canActivate: [AuthGuard],
            },
            {
                path: 'approvals',
                component: UniApprovals,
                canActivate: [AuthGuard],
            },
            {
                path: 'approvals/:id',
                component: UniApprovals,
                canActivate: [AuthGuard],
            }
        ]
    }
];

export const ROUTES: ModuleWithProviders = RouterModule.forChild(tasksRoutes);
