import {RouterModule} from '@angular/router';
import {Dashboard} from './components/dashboard/dashboard';
import {AuthGuard} from './authGuard';
import {UniDimensions, dimensionsRoutes} from './components/dimensions/dimensionsModule';

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
        canActivate: [AuthGuard]
    },
    {
        path: 'salary',
        loadChildren: './components/salary/salaryModule#SalaryModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'sales',
        loadChildren: './components/sales/salesModule#SalesModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'timetracking',
        loadChildren: './components/timetracking/timetrackingModule#TimetrackingModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'settings',
        loadChildren: './components/settings/settingsModule#SettingsModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'bank',
        loadChildren: './components/bank/bankModule#BankModule',
        canActivate: [AuthGuard]
    },


    // // WILDCARD ROUTE. ALWAYS KEEP THIS AT THE BOTTOM!
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    },
]);

export const APP_ROUTES = RouterModule.forRoot(routes);
