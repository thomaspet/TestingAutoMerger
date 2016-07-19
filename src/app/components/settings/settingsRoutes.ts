import {Route} from '@angular/router';
import {CompanySettings} from './companySettings/companySettings';
import {AgaAndSubEntitySettings} from './agaAndSubEntitySettings/agaAndSubEntitySettings';
import {UserSettings} from './userSettings/userSettings';
import {Users} from './users/users';
import {AltinnSettings} from './altinnSettings/altinnSettings';

export const routes: Route[] = [
    {
        path: '',
        redirectTo: 'company',
        pathMatch: 'full'
    },
    {
        path: 'company',
        component: CompanySettings
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
];
