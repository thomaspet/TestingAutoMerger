import {CategoryDetail} from './views/categoryDetails';

export const routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'details'
    },
    {
        path: 'details',
        component: CategoryDetail
    }
];
