import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {WorkerListview} from './worker/workers';
import {WorkerDetailview} from './worker/worker';

import {WorktypeListview} from './worktype/worktypes';
import {WorktypeDetailview} from './worktype/worktype';

import {WorkprofileListview} from './workprofile/workprofiles';
import {WorkprofileDetailview} from './workprofile/workprofile';

import {RegisterTime} from './regtime/regtime';
import {TimeEntry} from './timeentry/timeentry';

import {ProjectListview} from './project/projects';
import {ProjectDetailview} from './project/project';

import {CanDeactivateGuard} from '../../canDeactivateGuard';
import {UniTimetracking} from './timetracking';
import {AuthGuard} from '../../authGuard';

export const childRoutes: Routes = [
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
        component: WorkprofileDetailview
    },
    {
        path: 'workers',
        component: WorkerListview
    },
    {
        path: 'workers/:id',
        component: WorkerDetailview
    },
    {
        path: 'worktypes',
        component: WorktypeListview
    },
    {
        path: 'worktypes/:id',
        component: WorktypeDetailview
    },
    {
        path: 'projects',
        component: ProjectListview
    },
    {
        path: 'projects/:id',
        component: ProjectDetailview
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

const timetrackingRoutes: Routes = [
    {
        path: 'timetracking',
        component: UniTimetracking,
        canActivate: [AuthGuard],
        children: [{
            path: '',
            canActivateChild: [AuthGuard],
            children: childRoutes
        }],

    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(timetrackingRoutes);
