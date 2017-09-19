import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {UniTickerOverview} from './overview/overview';

const tickerRoutes: Routes = [
    {
        path: 'overview',
        component: UniTickerOverview,
    },
    {
        path: 'overview/:code',
        component: UniTickerOverview
    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(tickerRoutes);
