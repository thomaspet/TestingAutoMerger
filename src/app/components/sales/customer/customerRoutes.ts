import {CustomerList} from './list/customerList';
import {CustomerDetails} from './customerDetails/customerDetails';
import {CanDeactivateGuard} from '../../../canDeactivateGuard';


export const routes = [
    {
        path: '',
        component: CustomerList,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: ':id',
        component: CustomerDetails,
        canDeactivate: [CanDeactivateGuard]
    }
];
