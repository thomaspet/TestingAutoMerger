import {RouterModule} from '@angular/router';

import {Dashboard} from './components/dashboard/dashboard';
import {UniInit} from './components/init/init';
import {UniSalary} from './components/salary/salary';
import {UniSales} from './components/sales/sales';
import {Settings} from './components/settings/settings';
import {UniAccounting} from './components/accounting/accounting';
import {ProductList} from './components/common/product/list/productList';
import {ProductDetails} from './components/common/product/details/productDetails';
import {UniTimetracking} from './components/timetracking/timetracking';
import {UniReports} from './components/reports/reports';
import {Examples} from './components/examples/examples';

import {routes as InitRoutes} from './components/init/initRoutes';
import {routes as SalaryRoutes} from './components/salary/salaryRoutes';
import {routes as SalesRoutes} from './components/sales/salesRoutes';
import {routes as SettingRoutes} from './components/settings/settingsRoutes';
import {routes as AccountingRoutes} from './components/accounting/accountingRoutes';
import {routes as ReportRoutes} from './components/reports/reportsRoutes';
import {routes as ExampleRoutes} from './components/examples/examplesRoutes';
import {routes as TimetrackingRoutes} from './components/timetracking/timetrackingRoutes';

import {AuthGuard} from './AuthGuard';

export const routes = ([
    {
        path: 'init',
        component: UniInit,
        children: InitRoutes
    },

    {
        path: '',
        pathMatch: 'full',
        component: Dashboard,
        canActivate: [AuthGuard]
    },

    {
        path: 'salary',
        component: UniSalary,
        children: SalaryRoutes,
        canActivate: [AuthGuard]
    },

    {
        path: 'sales',
        component: UniSales,
        children: SalesRoutes,
        canActivate: [AuthGuard]
    },

    {
        path: 'settings',
        component: Settings,
        children: SettingRoutes,
        canActivate: [AuthGuard]
    },

    {
        path: 'accounting',
        component: UniAccounting,
        children: AccountingRoutes,
        canActivate: [AuthGuard]
    },

    {
        path: 'products',
        component: ProductList,
        canActivate: [AuthGuard]
    },
    {
        path: 'products/:id',
        component: ProductDetails,
        canActivate: [AuthGuard]
    },

    {
        path: 'timetracking',
        component: UniTimetracking,
        children: TimetrackingRoutes,
        canActivate: [AuthGuard]
    },

    {
        path: 'reports',
        component: UniReports,
        children: ReportRoutes,
        canActivate: [AuthGuard]
    },

    /// ROUTES FOR TESTING POURPOSES
    {
        path: 'examples',
        component: Examples,
        children: ExampleRoutes,
        canActivate: [AuthGuard]
    },


    // WILDCARD ROUTE. ALWAYS KEEP THIS AT THE BOTTOM!
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    },
]);

export const APP_ROUTES = RouterModule.forRoot(routes);
