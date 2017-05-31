import {TransqueryDetails} from './details/transqueryDetails';
export const routes = [
    {
        path: '',
        redirectTo: 'details',
        pathMatch: 'full',
    },
    {
        path: 'details',
        component: TransqueryDetails
    }
];
