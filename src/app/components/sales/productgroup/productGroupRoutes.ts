import {GroupDetails} from './groupDetails/groupDetails';
import {ProductsInGroup} from './productsInGroup/productsInGroup';

export const routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'groupDetails'
    },
    {
        path: 'groupDetails',
        component: GroupDetails
    },
    {
        path: 'productsInGroup',
        component: ProductsInGroup
    }
];
