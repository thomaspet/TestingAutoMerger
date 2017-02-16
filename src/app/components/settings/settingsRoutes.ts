import {Routes} from '@angular/router';
import {CompanySettingsComponent} from './companySettings/companySettings';
import {AgaAndSubEntitySettings} from './agaAndSubEntitySettings/agaAndSubEntitySettings';
import {UserSettings} from './userSettings/userSettings';
import {Users} from './users/users';
import {AltinnSettings} from './altinnSettings/altinnSettings';
import {WebHookSettings} from './webHookSettings/webHookSettings';
import {Settings} from './settings';

export const settingsRoutes: Routes = [{
    path: '',
    component: Settings,
    children: [{
        path: '',
        children: [
            { path: '', redirectTo: 'company' },
            { path: 'company', component: CompanySettingsComponent },
            { path: 'aga-and-subentities', component: AgaAndSubEntitySettings },
            { path: 'webhooks', component: WebHookSettings },
            { path: 'user', component: UserSettings },
            { path: 'users', component: Users },
            { path: 'altinn', component: AltinnSettings },
        ]
    }]
}];
