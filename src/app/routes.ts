import {RouterModule} from '@angular/router';
import {Dashboard} from './components/dashboard/dashboard';
import {ProductList} from './components/common/product/list/productList';
import {ProductDetails} from './components/common/product/details/productDetails';
import {AuthGuard} from './authGuard';

// Widget demo
import {UniWidgetDemo} from './components/widgets/demo/widgetDemo';

export const routes = ([
    {
        path: '',
        pathMatch: 'full',
        component: Dashboard,
        canActivate: [AuthGuard]
    },

    // Widget demo
    {
        path: 'widgets',
        component: UniWidgetDemo
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
