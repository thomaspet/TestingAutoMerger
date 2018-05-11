import {Routes} from '@angular/router';
import {CompanySettingsComponent} from './companySettings/companySettings';
import {AgaAndSubEntitySettings} from './agaAndSubEntitySettings/agaAndSubEntitySettings';
import {Users} from './users/users';
import {Teams} from './teams/teams';
import {NumberSeries} from './numberSeries/numberSeries';
import {AltinnSettings} from './altinnSettings/altinnSettings';
import {WebHookSettings} from './webHookSettings/webHookSettings';
import {Settings} from './settings';
import {CanDeactivateGuard} from '../../canDeactivateGuard';
import {UniTerms} from './terms/terms';
import {UniBankSettings} from './bank/bankSettings';
import {UniDimensionSettings} from './dimension/dimension';
import {IntegrationSettings} from './integrationSettings/integrationSettings';

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
            component: Users
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
        },
        // {
        //     path: 'banksettings',
        //     component: UniBankSettings,
        //     canDeactivate: [CanDeactivateGuard]
        // }
    ]
}];
