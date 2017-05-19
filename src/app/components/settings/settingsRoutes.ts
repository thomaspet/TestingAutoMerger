import {Routes} from '@angular/router';
import {CompanySettingsComponent} from './companySettings/companySettings';
import {AgaAndSubEntitySettings} from './agaAndSubEntitySettings/agaAndSubEntitySettings';
import {UserSettings} from './userSettings/userSettings';
import {Users} from './users/users';
import {Teams} from './teams/teams';
import {NumberSeries} from './numberSeries/numberSeries';
import {AltinnSettings} from './altinnSettings/altinnSettings';
import {WebHookSettings} from './webHookSettings/webHookSettings';
import {Settings} from './settings';
import {CanDeactivateGuard} from '../../canDeactivateGuard';

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
            component: WebHookSettings,
            canDeactivate: [CanDeactivateGuard]
        },
        {
            path: 'user',
            component: UserSettings,
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
        }
    ]
}];
