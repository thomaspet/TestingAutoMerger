import { SalarybalanceDetail } from './views/salarybalanceDetails';

export const routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'details'
    },
    {
        path: 'details',
        component: SalarybalanceDetail
    }
];
