import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../authGuard';

//import {routes as JobsRoutes} from './jobs/jobsRoutes';

import {UniAdmin} from './admin';
import {Jobs} from './jobs/jobs';

export const childRoutes = [
    {
        path: 'jobs',
        component: Jobs
        //children: JobsRoutes
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
