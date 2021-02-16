import { Routes } from '@angular/router';
import { CanDeactivateGuard } from '@app/canDeactivateGuard';
import { IncomeReportComponent } from './income-report/income-report.component';
import { IncomeReportsListComponent } from './income-reports-list/income-reports-list.component';
import { NewIncomeReportGuard } from './new-income-report.guard';

export const incomeReportsRoutes: Routes = [
    {
        path: '',
        component: IncomeReportsListComponent
    },
    {
        path: ':id',
        component: IncomeReportComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [NewIncomeReportGuard],
    }
];

