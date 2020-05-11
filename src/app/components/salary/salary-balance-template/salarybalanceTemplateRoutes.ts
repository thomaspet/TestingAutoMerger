import {SalarybalanceTemplateDetailsComponent} from './salarybalance-template-details/salarybalance-template-details.component';

export const routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'details'
    },
    {
        path: 'details',
        component: SalarybalanceTemplateDetailsComponent
    }
];
