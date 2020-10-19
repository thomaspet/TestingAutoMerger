import {Routes} from '@angular/router';
import {AgaAndSubEntitySettings} from './agaAndSubEntitySettings/agaAndSubEntitySettings';
import {Teams} from './teams/teams';
import {NumberSeries} from './numberSeries/numberSeries';
import {CanDeactivateGuard} from '../../canDeactivateGuard';
import {UniTerms} from './terms/terms';
import {UniDistributionSettings} from './distribution/distribution';
import {UniDimensionSettings} from './dimension/dimension';
import {IntegrationSettings} from './integrationSettings/integrationSettings';
import {UserManagement} from '@app/components/settings/users/users';
import {SettingsOverview} from './settings-overview/settings-overivew';
import {UniCompanySettingsView} from './companySettings/company-settings';
import {UniCompanyAccountingView} from './accounting-settings/accounting-settings';
import {UniSalesSettingsView} from './sales-settings/sales-settings';
import {UniBankSettings} from './bank-settings/bank-settings';
import {OpeningBalanceComponent} from '@app/components/settings/opening-balance/openingBalance';
import {OpeningBalanceGuard} from '@app/components/settings/opening-balance/openingBalanceGuard';

export const settingsRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: SettingsOverview
    },
    {
        path: 'company',
        component: UniCompanySettingsView,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'accounting',
        component: UniCompanyAccountingView,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'sales',
        component: UniSalesSettingsView,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'distribution',
        component: UniDistributionSettings,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'aga-and-subentities',
        component: AgaAndSubEntitySettings,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'bank',
        component: UniBankSettings,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'webhooks',
        component: IntegrationSettings,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'users',
        component: UserManagement
    },
    {
        path: 'teams',
        component: Teams,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'numberseries',
        component: NumberSeries,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'terms',
        component: UniTerms,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'dimension',
        component: UniDimensionSettings,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'opening-balance',
        loadChildren: () => import('./opening-balance/openingBalanceModule').then(m => m.OpeningBalanceModule),
        canActivate: [OpeningBalanceGuard],
        canDeactivate: [CanDeactivateGuard]
    }
];
