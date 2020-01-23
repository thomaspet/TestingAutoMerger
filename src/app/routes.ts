import {RouterModule} from '@angular/router';
import {AuthGuard} from './authGuard';
import {CompanyKeyRouteGuard} from './companyKeyRouteGuard';
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
import {ReloadHelper} from './reload';

const routes = [
    {
        path: '',
        pathMatch: 'full',
        component: Dashboard,
    },
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
        loadChildren: () => import('./components/accounting/accountingModule').then(m => m.AccountingModule),
    },
    {
        path: 'salary',
        loadChildren: () => import('./components/salary/salary.module').then(m => m.SalaryModule),
    },
    {
        path: 'sales',
        loadChildren: () => import('./components/sales/salesModule').then(m => m.SalesModule),
    },
    {
        path: 'timetracking',
        loadChildren: () => import('./components/timetracking/timetrackingModule').then(m => m.TimetrackingModule),
    },
    {
        path: 'settings',
        loadChildren: () => import('./components/settings/settingsModule').then(m => m.SettingsModule),
    },
    {
        path: 'bank',
        loadChildren: () => import('./components/bank/bankModule').then(m => m.BankModule),
    },
    {
        path: 'altinn',
        loadChildren: () => import('./components/altinn/altinnModule').then(m => m.AltinnModule),
    },
    {
        path: 'contract-activation',
        loadChildren: () => import('./components/contract-activation/contract-activation.module').then(m => m.ContractActivationModule)
    },
    {
        path: 'license-info',
        loadChildren: () => import('./components/license-info/license-info.module').then(m => m.LicenseInfoModule)
    },
    {
        path: 'approval-rules',
        loadChildren: () => import('./components/approval-rules/approval-rules.module').then(m => m.ApprovalRulesModule),
    },
    {
        path: 'import',
        loadChildren: () => import('./components/import-central/import-central.module').then(m => m.ImportCentralModule),
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
        canActivate: [AuthGuard, CompanyKeyRouteGuard],
        canActivateChild: [RoutePermissionGuard],
        children: routes
    }
]);
