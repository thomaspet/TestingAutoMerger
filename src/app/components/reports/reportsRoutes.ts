import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {Overview} from './overview/overview';
import {AuthGuard} from '../../authGuard';
import {UniReports} from './reports';


export const childRoutes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview'
    },
    {
        path: 'overview',
        component: Overview
    }
];

const reportRoutes: Routes = [
    {
        path: 'reports',
        component: UniReports,
        canActivate: [AuthGuard],
        children: [{
            path: '',
            canActivateChild: [AuthGuard],
            children: childRoutes
        }],

    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(reportRoutes);
