import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {UniTickers} from './uniTickers';
import {UniTickerOverview} from './overview/overview';

export const childRoutes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview'
    },
    {
        path: 'overview',
        component: UniTickerOverview
    },
    {
        path: 'ticker/:code',
        component: UniTickerOverview
    }
];

const uniQueryRoutes: Routes = [
    {
        path: 'tickers',
        component: UniTickers,
        children: childRoutes
    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(uniQueryRoutes);
