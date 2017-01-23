import {Routes} from '@angular/router';

import {WorkerListview} from './worker/workers';
import {WorkerDetailview} from './worker/worker';

import {WorktypeListview} from './worktype/worktypes';
import {WorktypeDetailview} from './worktype/worktype';

import {WorkprofileListview} from './workprofile/workprofiles';
import {WorkprofileDetailview} from './workprofile/workprofile';

import {RegisterTime} from './regtime/regtime';
import {TimeEntry} from './timeentry/timeentry';

import {CanDeactivateGuard} from '../../canDeactivateGuard';
import {UniTimetracking} from './timetracking';
import {AuthGuard} from '../../authGuard';

// Maps entitytype to frontend route
// Important for notifications to work properly!
export const entityTypeMap: any = {
    'workprofile': 'workprofiles/:id',
    'worker': 'workers/:id',
    'worktype': 'worktypes/:id',
};

export const timetrackingRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'timeentry'
    },
    {
        path: 'workprofiles',
        component: WorkprofileListview
    },
    {
        path: 'workprofiles/:id',
        component: WorkprofileDetailview,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'workers',
        component: WorkerListview
    },
    {
        path: 'workers/:id',
        component: WorkerDetailview,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'worktypes',
        component: WorktypeListview
    },
    {
        path: 'worktypes/:id',
        component: WorktypeDetailview,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'timeentry',
        component: TimeEntry,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'regtime',
        component: RegisterTime,
        canDeactivate: [CanDeactivateGuard]
    }
];

// const timetrackingRoutes: Routes = [
//     {
//         path: 'timetracking',
//         component: UniTimetracking,
//         canActivate: [AuthGuard],
//         children: [{
//             path: '',
//             canActivateChild: [AuthGuard],
//             children: childRoutes
//         }],

//     }
// ];

// export const routes: ModuleWithProviders = RouterModule.forChild(timetrackingRoutes);
