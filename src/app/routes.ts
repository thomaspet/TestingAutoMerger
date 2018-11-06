import {RouterModule} from '@angular/router';
import {AuthGuard} from './authGuard';
import {CanDeactivateGuard} from './canDeactivateGuard';
import {RoutePermissionGuard} from './routePermissionGuard';

import {Dashboard} from './components/dashboard/dashboard';
import {UniTickerOverview} from './components/uniticker/overview/overview';
import {UniInit} from './components/init/init';
import {initRoutes} from './components/init/init.routes';

import {aboutRoutes} from './components/about/aboutRoutes';
import {adminRoutes} from './components/admin/adminRoutes';
import {assignmentRoutes} from './components/assignments/assignmentsRoutes';
import {bureauRoutes} from './components/bureau/bureauRoutes';
import {currencyRoutes} from './components/currency/currencyRoutes';
import {dimensionsRoutes} from './components/dimensions/dimensionsRoutes';
import {marketplaceRoutes} from './components/marketplace/marketplaceRoutes';
import {uniQueryRoutes} from './components/uniquery/uniQueriesRoutes';

import {SharingsList} from './components/sharings/list/sharingsList';
import {UniReports} from './components/reports/reports';
import {ContactDetails} from './components/common/contact/contactDetails';
import {PredefinedDescriptionList} from './components/common/predefinedDescriptions/predefinedDescriptionList';
import { Uniform2TestComponent } from '@uni-framework/ui/uniform2/uniform2-test/uniform2-test.component';
import {ReloadHelper} from './reload';

const routes = [
    {
        path: '',
        pathMatch: 'full',
        component: Dashboard,
    },
    // add it for testing pourposes on uniform2
    // {
    //     path: 'test',
    //     component: Uniform2TestComponent,
    // },
    {
        path: 'overview',
        component: UniTickerOverview
    },
    {
        path: 'sharings',
        component: SharingsList
    },
    {
        path: 'reports',
        component: UniReports
    },
    {
        path: 'contacts/:id',
        component: ContactDetails,
        canDeactivate: [CanDeactivateGuard],
    },
    {
        path: 'predefined-descriptions',
        component: PredefinedDescriptionList,
        canDeactivate: [CanDeactivateGuard],
    },

    // Non lazy modules
    ...aboutRoutes,
    ...adminRoutes,
    ...assignmentRoutes,
    ...bureauRoutes,
    ...currencyRoutes,
    ...dimensionsRoutes,
    ...marketplaceRoutes,
    ...uniQueryRoutes,

    // Lazy modules
    {
        path: 'accounting',
        loadChildren: './components/accounting/accountingModule#AccountingModule',
    },
    {
        path: 'salary',
        loadChildren: './components/salary/salary.module#SalaryModule',
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
    {
        // Dont remove this one! See description inside the component.
        path: 'reload',
        component: ReloadHelper
    },

    // everything else does
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [RoutePermissionGuard],
        children: routes
    }
]);
