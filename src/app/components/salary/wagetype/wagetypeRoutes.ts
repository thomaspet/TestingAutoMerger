import {WagetypeDetail} from './views/wagetypeDetails';
import {WageTypeSettings} from './views/wagetypeSettings';
import {WageTypeLimitValues} from './views/wagetypeLimitValues';

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
    },
    {
        path: 'limit-values',
        component: WageTypeLimitValues
    }

];
