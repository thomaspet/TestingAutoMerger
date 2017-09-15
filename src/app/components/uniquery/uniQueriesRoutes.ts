import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {UniQueries} from './uniQueries';
import {UniQueryOverview} from './overview/overview';
import {UniQueryDetails} from './details/uniQueryDetails';

const childRoutes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview'
    },
    {
        path: 'overview',
        component: UniQueryOverview
    },
    {
        path: 'details/:id',
        component: UniQueryDetails
    }
];

const uniQueryRoutes: Routes = [
    {
        path: 'uniqueries',
        component: UniQueries,
        children: childRoutes
    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(uniQueryRoutes);
