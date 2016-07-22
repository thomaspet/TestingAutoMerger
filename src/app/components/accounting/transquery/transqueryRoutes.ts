import {TransqueryList} from './list/transqueryList';
import {TransqueryDetails} from './details/transqueryDetails';
export const routes = [
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
    },
    {
        path: 'list',
        component: TransqueryList
    },
    {
        path: 'details',
        component: TransqueryDetails
    }
];
