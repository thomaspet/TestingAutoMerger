import {WageTypeDetailsComponent} from './wage-type-details/wage-type-details.component';
import {WageTypeSettingsComponent} from './wage-type-settings/wage-type-settings.component';

export const routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'details'
    },
    {
        path: 'details',
        component: WageTypeDetailsComponent,
    },
    {
        path: 'spesial-settings',
        component: WageTypeSettingsComponent,
    }

];
