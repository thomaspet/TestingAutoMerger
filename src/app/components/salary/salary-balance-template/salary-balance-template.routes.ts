import {SalaryBalanceTemplateDetailsComponent} from './salary-balance-template-details/salary-balance-template-details.component';

export const routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'details'
    },
    {
        path: 'details',
        component: SalaryBalanceTemplateDetailsComponent
    }
];
