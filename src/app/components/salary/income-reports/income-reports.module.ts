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
import { IncomeReportsService } from '@app/components/salary/income-reports/shared/shared-services/incomeReportsService';
import { IncomeReportModal } from './shared/components/income-report-modal/income-report-modal';
import { IncomeReportComponent } from './income-report/income-report.component';
import { NewIncomeReportGuard } from './new-income-report.guard';
import { IncomeReportEmployer } from './income-report/income-report-employer';
import { IncomeReportIncomeDetail } from './income-report/income-report-incomedetail';
import { IncomeReportNaturalytelser } from './income-report/income-report-forms/income-report-naturalytelser';
import { IncomeReportFerie } from './income-report/income-report-forms/income-report-ferie';
import { IncomeReportHelperService } from './shared/shared-services/incomeReportHelperService';
import { IncomeReportStore } from './income-reports.store';
import { IncomeReportArbeidsgiverperiode } from './income-report/income-report-forms/income-report-arbeidsgiverperiode';
import { IncomeReportOmsorgspenger } from './income-report/income-report-forms/income-report-omsorgspenger';
import { IncomeReportNaturalytelseModal } from './income-report/income-report-modals/naturalytelse-modal/income-report-naturalytelse.modal';
import { IncomeReportChangeIncomeModal } from './income-report/income-report-modals/change-income-modal/income-report-changeincome.modal';
import { NaturalytelseTextPipe } from './income-report/naturalytelserText.pipe';
import { IncomeReportPleiepenger } from './income-report/income-report-forms/income-report-pleiepenger';
import { IncomeReportDatePeriodPickerComponent } from './shared/components/income-report-date-period-picker/income-report-date-period-picker.component';
import { IncomeReportMonthlyPayModal } from './income-report/income-report-modals/monthly-pay-modal/income-report-monthlypay.modal';
import { IncomeReportMonthlyPayService } from './shared/shared-services/incomeReportMonthlyPayService';
import { IncomeReportRefusjon } from './income-report/income-report-forms/income-report-refusjon';

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
        IncomeReportComponent,
        IncomeReportEmployer,
        IncomeReportIncomeDetail,
        IncomeReportChangeIncomeModal,
        IncomeReportRefusjon,
        IncomeReportNaturalytelser,
        IncomeReportNaturalytelseModal,
        IncomeReportFerie,
        IncomeReportArbeidsgiverperiode,
        IncomeReportMonthlyPayModal,
        IncomeReportOmsorgspenger,
        IncomeReportPleiepenger,
        NaturalytelseTextPipe,
        IncomeReportDatePeriodPickerComponent,
    ],
    providers: [
        IncomeReportsActions,
        IncomeReportsService,
        IncomeReportHelperService,
        IncomeReportMonthlyPayService,
        NaturalytelseTextPipe,
        IncomeReportStore,
        NewIncomeReportGuard
    ]

})

export class IncomeReportsModule {}
