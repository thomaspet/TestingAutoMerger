import {CustomerList} from './list/customerList';
import {CustomerAdd} from './add/customerAdd';
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
        path: 'add',
        component: CustomerAdd
    },
    {
        path: 'details/:id',
        component: CustomerDetails
    }
];
