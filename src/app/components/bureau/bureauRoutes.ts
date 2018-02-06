import {BureauDashboard} from './bureauDashboard';
import {BureauTaskTab} from './detailView/bureauTasksTab';
import {BureauCompanyTab} from './detailView/bureauCompanyTab';
import {BureauAccountingTab} from './detailView/bureauAccountingTab';
import {BureauSalesTab} from './detailView/bureauSalesTab';
import {BureauSalaryTab} from './detailView/bureauSalaryTab';
import {BureauHoursTab} from './detailView/bureauHoursTab';

export const bureauRoutes = [
    {
        path: 'bureau',
        component: BureauDashboard,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'tasks',
            },
            {
                path: 'tasks',
                component: BureauTaskTab,
            },
            {
                path: 'company',
                component: BureauCompanyTab,
            },
            {
                path: 'accounting',
                component: BureauAccountingTab,
            },
            {
                path: 'sales',
                component: BureauSalesTab,
            },
            {
                path: 'salary',
                component: BureauSalaryTab,
            },
            {
                path: 'hours',
                component: BureauHoursTab,
            },
        ]
    }
];
