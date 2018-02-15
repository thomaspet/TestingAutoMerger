import {Routes} from '@angular/router';
import {UniAssignments} from './assignments';
import {UniTasks} from './tasks/tasks';
import {UniApprovals} from './approvals/approvals';

export const assignmentRoutes: Routes = [
    {
        path: 'assignments',
        component: UniAssignments,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'approvals'
            },
            {
                path: 'tasks',
                component: UniTasks,
            },
            {
                path: 'tasks/:id',
                component: UniTasks,
            },
            {
                path: 'approvals',
                component: UniApprovals,
            },
            {
                path: 'approvals/:id',
                component: UniApprovals,
            }
        ]
    },
];
