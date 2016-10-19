import {CustomerList} from './list/customerList';
import {CustomerDetails} from './customerDetails/customerDetails';

export const routes = [
    {
        path: '',
        redirectTo: 'list'
    },
    {
        path: 'list',
        component: CustomerList
    },
    {
        path: 'details/:id',
        component: CustomerDetails
    }
];
