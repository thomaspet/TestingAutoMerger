import {Routes} from '@angular/router';
import {CompanySettingsComponent} from './companySettings/companySettings';
import {AgaAndSubEntitySettings} from './agaAndSubEntitySettings/agaAndSubEntitySettings';
import {UserSettings} from './userSettings/userSettings';
import {Users} from './users/users';
import {AltinnSettings} from './altinnSettings/altinnSettings';
import {Settings} from './settings';

export const settingsRoutes: Routes = [
    {
        path: '',
        component: Settings,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'company'
            },
            {
                path: 'company',
                component: CompanySettingsComponent
            },
            {
                path: 'aga-and-subentities',
                component: AgaAndSubEntitySettings
            },
            {
                path: 'user',
                component: UserSettings
            },
            {
                path: 'users',
                component: Users
            },
            {
                path: 'altinn',
                component: AltinnSettings
            }
        ]
    }
];
