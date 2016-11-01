import {CustomerList} from './list/customerList';
import {CustomerDetails} from './customerDetails/customerDetails';

export const routes = [
    {
        path: '',
        component: CustomerList
    },
    {
        path: ':id',
        component: CustomerDetails
    }
];
