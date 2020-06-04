import {CategoryDetailComponent} from './views/category-details.component';

export const routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'details'
    },
    {
        path: 'details',
        component: CategoryDetailComponent
    }
];
