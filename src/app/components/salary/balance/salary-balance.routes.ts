import { SalaryBalanceDetailsComponent } from '../shared/components/salary-balance-details/salary-balance-details.component';

export const routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'details'
    },
    {
        path: 'details',
        component: SalaryBalanceDetailsComponent
    }
];
