import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AuthGuard} from '../../authGuard';
import {UniReports} from './reports';

const reportRoutes: Routes = [
    {
        path: 'reports',
        component: UniReports,
        canActivate: [AuthGuard]
    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(reportRoutes);
