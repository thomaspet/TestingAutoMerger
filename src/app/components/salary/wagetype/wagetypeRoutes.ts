import {WagetypeDetail} from './views/wagetypeDetails';
import {WageTypeSettings} from './views/wagetypeSettings';

export const routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'details'
    },
    {
        path: 'details',
        component: WagetypeDetail
    },
    {
        path: 'spesial-settings',
        component: WageTypeSettings
    }

];
