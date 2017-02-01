import {RouterModule} from '@angular/router';
import {Dashboard} from './components/dashboard/dashboard';
import {ProductList} from './components/common/product/list/productList';
import {ProductDetails} from './components/common/product/details/productDetails';

import {AuthGuard} from './authGuard';

export const routes = ([
    {
        path: '',
        pathMatch: 'full',
        component: Dashboard,
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
        path: 'accounting',
        loadChildren: './components/accounting/AccountingModule#AccountingModule'
    },
    {
        path: 'salary',
        loadChildren: './components/salary/salaryModule#SalaryModule'
    },
    {
        path: 'sales',
        loadChildren: './components/sales/salesModule#SalesModule'
    },
    {
        path: 'timetracking',
        loadChildren: './components/timetracking/timetrackingModule#TimetrackingModule'
    },
    {
        path: 'settings',
        loadChildren: './components/settings/settingsModule#SettingsModule'
    },
    {
        path: 'bank',
        loadChildren: './components/bank/bankModule#BankModule'
    }




    // // WILDCARD ROUTE. ALWAYS KEEP THIS AT THE BOTTOM!
    // {
    //     path: '**',
    //     redirectTo: '',
    //     pathMatch: 'full'
    // },
]);

export const APP_ROUTES = RouterModule.forRoot(routes);
