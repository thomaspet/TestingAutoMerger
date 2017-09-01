import {RouterModule} from '@angular/router';
import {Dashboard} from './components/dashboard/dashboard';
import {AuthGuard} from './authGuard';

import {UniDimensions, dimensionsRoutes} from './components/dimensions/dimensionsModule';
import {CanActivateGuard} from './canActivateGuard';

export const routes = ([
    {
        path: '',
        pathMatch: 'full',
        component: Dashboard,
        canActivate: [AuthGuard]
    },

    {
        path: 'dimensions',
        component: UniDimensions,
        canActivate: [AuthGuard],
        children: [{
            path: '',
            canActivateChild: [AuthGuard],
            children: dimensionsRoutes
        }],
    },

    // Lazy loaded modules
    {
        path: 'accounting',
        loadChildren: './components/accounting/AccountingModule#AccountingModule',
        canActivate: [AuthGuard],
        canActivateChild: [CanActivateGuard]
    },
    {
        path: 'salary',
        loadChildren: './components/salary/salaryModule#SalaryModule',
        canActivate: [AuthGuard],
        canActivateChild: [CanActivateGuard]
    },
    {
        path: 'sales',
        loadChildren: './components/sales/salesModule#SalesModule',
        canActivate: [AuthGuard],
        canActivateChild: [CanActivateGuard]
    },
    {
        path: 'timetracking',
        loadChildren: './components/timetracking/timetrackingModule#TimetrackingModule',
        canActivate: [AuthGuard],
        canActivateChild: [CanActivateGuard]
    },
    {
        path: 'settings',
        loadChildren: './components/settings/settingsModule#SettingsModule',
        canActivate: [AuthGuard],
        canActivateChild: [CanActivateGuard]
    },
    {
        path: 'bank',
        loadChildren: './components/bank/bankModule#BankModule',
        canActivate: [AuthGuard],
        canActivateChild: [CanActivateGuard]
    },


    // // WILDCARD ROUTE. ALWAYS KEEP THIS AT THE BOTTOM!
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    },
]);

export const APP_ROUTES = RouterModule.forRoot(routes);
