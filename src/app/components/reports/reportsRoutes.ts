import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {UniReports} from './reports';

const reportRoutes: Routes = [
    {
        path: 'reports',
        component: UniReports,
    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(reportRoutes);
