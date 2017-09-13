import {GroupDetails} from './groupDetails/groupDetails';

export const routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'groupDetails'
    },
    {
        path: 'groupDetails',
        component: GroupDetails
    }
];
