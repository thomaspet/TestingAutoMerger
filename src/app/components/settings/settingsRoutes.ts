import {Routes} from '@angular/router';
import {CompanySettingsComponent} from './companySettings/companySettings';
import {AgaAndSubEntitySettings} from './agaAndSubEntitySettings/agaAndSubEntitySettings';
import {Teams} from './teams/teams';
import {NumberSeries} from './numberSeries/numberSeries';
import {AltinnSettings} from './altinnSettings/altinnSettings';
import {Settings} from './settings';
import {CanDeactivateGuard} from '../../canDeactivateGuard';
import {UniTerms} from './terms/terms';
import {UniDistributionSettings} from './distribution/distribution';
import {UniDimensionSettings} from './dimension/dimension';
import {IntegrationSettings} from './integrationSettings/integrationSettings';
import {UserManagement} from '@app/components/settings/users/users';

export const settingsRoutes: Routes = [{
    path: '',
    component: Settings,
    children: [
        {
            path: '',
            redirectTo: 'company',
            pathMatch: 'full'
        },
        {
            path: 'company',
            component: CompanySettingsComponent,
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
            path: 'webhooks',
            component: IntegrationSettings, // WebHookSettings,
            canDeactivate: [CanDeactivateGuard]
        },
        {
            path: 'users',
            component: UserManagement
        },
        {
            path: 'altinn',
            component: AltinnSettings,
            canDeactivate: [CanDeactivateGuard]
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
        }
        // {
        //     path: 'banksettings',
        //     component: UniBankSettings,
        //     canDeactivate: [CanDeactivateGuard]
        // }
    ]
}];
