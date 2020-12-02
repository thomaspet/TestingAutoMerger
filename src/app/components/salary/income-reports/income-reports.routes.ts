import { Routes } from '@angular/router';
import { IncomeReportComponent } from './income-report/income-report.component';
import { IncomeReportsListComponent } from './income-reports-list/income-reports-list.component';

export const incomeReportsRoutes: Routes = [
    {
        path: '',
        component: IncomeReportsListComponent
    },
    {
        path: ':id',
        component: IncomeReportComponent
    }
];

