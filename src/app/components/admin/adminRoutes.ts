import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../authGuard';
import {CanDeactivateGuard} from '../../canDeactivateGuard';

// module
import {UniAdmin} from './admin';
import {JobList} from './jobs/list/jobList';
import {JobDetails} from './jobs/details/jobDetails';
import {JobLog} from './jobs/log/jobLog';
import {UniModels} from './models/models';
import {UniRoles} from './roles/roles';
import {ApprovalThresholds} from './approvalThresholds/list/approvalThresholds';

export const childRoutes = [
    {
        path: 'jobs',
        component: JobList
    },
    {
        path: 'job-details/:id',
        component: JobDetails,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'job-logs/:jobName/:jobRunId',
        component: JobLog,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'models',
        component: UniModels,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'roles',
        component: UniRoles,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'thresholds',
        component: ApprovalThresholds
    }
];

const adminRoutes: Routes = [
    {
        path: 'admin',
        component: UniAdmin,
        canActivate: [AuthGuard],
        children: [{
            path: '',
            canActivateChild: [AuthGuard],
            children: childRoutes
        }],

    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(adminRoutes);
