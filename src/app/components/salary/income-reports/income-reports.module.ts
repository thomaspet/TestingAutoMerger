import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppCommonModule } from '@app/components/common/appCommonModule';
import { LayoutModule } from '@app/components/layout/layoutModule';
import { LibraryImportsModule } from '@app/library-imports.module';
import { UniFrameworkModule } from '@uni-framework/frameworkModule';
import { IncomeReportsListTab } from './income-reports-list/income-reports-list-tab';
import { IncomeReportsListToolbar } from './income-reports-list/income-reports-list-toolbar';
import { IncomeReportsListComponent } from './income-reports-list/income-reports-list.component';
import { incomeReportsRoutes } from './income-reports.routes';
import { IncomeReportsActions } from './income-reports.actions';
import { IncomeReportsService } from '@app/components/salary/income-reports/shared-services/incomeReportsService';
import { IncomeReportModal } from './income-report-modal/income-report-modal';
import { IncomeReportComponent } from './income-report/income-report.component';

@NgModule({
    imports: [
        LibraryImportsModule,
        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
        RouterModule.forChild(incomeReportsRoutes)
    ],
    declarations: [
        IncomeReportsListComponent,
        IncomeReportsListTab,
        IncomeReportsListToolbar,
        IncomeReportModal,
        IncomeReportComponent
    ],
    providers: [
        IncomeReportsActions,
        IncomeReportsService
    ]

})

export class IncomeReportsModule {}
