import {RouterModule} from '@angular/router';
import {Dashboard} from './components/dashboard/dashboard';
import {AuthGuard} from './authGuard';

import {UniDimensions, dimensionsRoutes} from './components/dimensions/dimensionsModule';
import {RoutePermissionGuard} from './routePermissionGuard';
import {UniInit} from './components/init/init';
import {initRoutes} from './components/init/init.routes';

const routes = [
    {
        path: '',
        pathMatch: 'full',
        component: Dashboard,
    },
    {
        path: 'dimensions',
        component: UniDimensions,
        children: dimensionsRoutes
    },

    // Lazy loaded modules
    {
        path: 'accounting',
        loadChildren: './components/accounting/AccountingModule#AccountingModule',
    },
    {
        path: 'salary',
        loadChildren: './components/salary/salaryModule#SalaryModule',
    },
    {
        path: 'sales',
        loadChildren: './components/sales/salesModule#SalesModule',
    },
    {
        path: 'timetracking',
        loadChildren: './components/timetracking/timetrackingModule#TimetrackingModule',
    },
    {
        path: 'settings',
        loadChildren: './components/settings/settingsModule#SettingsModule',
    },
    {
        path: 'bank',
        loadChildren: './components/bank/bankModule#BankModule',
    },

    // WILDCARD ROUTE. ALWAYS KEEP THIS AT THE BOTTOM!
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    },
];

export const APP_ROUTES = RouterModule.forRoot([
    // init doesn't have to pass auth control
    {
        path: 'init',
        component: UniInit,
        children: initRoutes
    },

    // everything else does
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [RoutePermissionGuard],
        children: routes
    }
]);
