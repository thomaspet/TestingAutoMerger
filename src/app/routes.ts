import {RouterModule} from '@angular/router';

import {Dashboard} from './components/dashboard/dashboard';
import {ProductList} from './components/common/product/list/productList';
import {ProductDetails} from './components/common/product/details/productDetails';
import {UniTimetracking} from './components/timetracking/timetracking';
import {routes as SalesRoutes} from './components/sales/salesRoutes';
import {routes as SettingRoutes} from './components/settings/settingsRoutes';
import {routes as TimetrackingRoutes} from './components/timetracking/timetrackingRoutes';

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


    // WILDCARD ROUTE. ALWAYS KEEP THIS AT THE BOTTOM!
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    },
]);

export const APP_ROUTES = RouterModule.forRoot(routes);
