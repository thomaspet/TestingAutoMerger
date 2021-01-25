import { NgModule } from '@angular/core';
import { SalaryBalanceListComponent } from './components/salary-balance-list/salary-balance-list.component';
import { LibraryImportsModule } from '@app/library-imports.module';
import { UniTickerModule } from '@app/components/uniticker/uniTickerModule';
import { UniFrameworkModule } from '@uni-framework/frameworkModule';
import { LayoutModule } from '@angular/cdk/layout';
import { AppCommonModule } from '@app/components/common/appCommonModule';
import { ReportsModule } from '@app/components/reports/reportsModule';
import { AltinnResponseStatusComponent } from './components/altinn-response-status/altinn-response-status.component';
import { EmployeeReportPickerListComponent } from './components/employee-report-picker-list/employee-report-picker-list.component';
import { NewRegulativeModalComponent } from './components/new-regulative-modal/new-regulative-modal.component';
import { RegulativeUploadModalComponent } from './components/regulative-upload-modal/regulative-upload-modal.component';
import { SalaryBalanceDetailsComponent } from './components/salary-balance-details/salary-balance-details.component';
import { SalaryBalanceSummaryComponent } from './components/salary-balance-summary/salary-balance-summary.component';
import { SalaryTransSupplementModalComponent } from './components/salary-transaction-supplement-modal/salary-transaction-supplement-modal.component';
import { SyncWagetypesModalComponent } from './components/sync-wagetypes-modal/sync-wagetypes-modal.component';
import { EmployeeCategoryService } from './services/category/employee-category.service';
import { EmployeeOnCategoryService } from './services/category/employee-on-category.service';
import { PayrollRunOnCategoryService } from './services/category/payroll-run-on-category.service';
import { SalaryBalanceViewService } from './services/salary-balance/salary-balance-view.service';
import { SalarySumsService } from './services/salary-transaction/salary-sums.service';
import { SalaryTransactionSuggestedValuesService } from './services/salary-transaction/salary-transaction-suggested-values.service';
import { SalaryTransactionSupplementService } from './services/salary-transaction/salary-transaction-supplement.service';
import { SalaryTransactionViewService } from './services/salary-transaction/salary-transaction-view.service';
import { RegulativeImportComponent } from './components/regulative-import/regulative-import.component';
import { PayrollRunService } from './services/payroll-run/payroll-run.service';
import { TaxCardModal } from './components/tax-card-modal/tax-card-modal.component';
import { ReadTaxCardComponent } from './components/tax-card-modal/read-tax-card.component';
import { TaxCardRequestComponent } from './components/tax-card-modal/tax-card-request.component';
import { TaxResponseModalComponent } from './components/tax-card-modal/tax-response-modal.component';
import { TaxCardReadStatusComponent } from './components/tax-card-modal/tax-card-read-status.component';
import { SalaryYearService } from './services/salary-year/salary-year.service';
import { EmployeeReportPickerService } from './services/employee-report-picker/employee-report-picker.service';


@NgModule({
    imports: [
        LibraryImportsModule,
        UniTickerModule,
        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
        ReportsModule,
    ],
    declarations: [
        SalaryBalanceListComponent,
        AltinnResponseStatusComponent,
        EmployeeReportPickerListComponent,
        NewRegulativeModalComponent,
        RegulativeUploadModalComponent,
        SalaryBalanceDetailsComponent,
        SalaryBalanceSummaryComponent,
        SalaryTransSupplementModalComponent,
        SyncWagetypesModalComponent,
        RegulativeImportComponent,
        TaxCardModal,
        ReadTaxCardComponent,
        TaxCardRequestComponent,
        TaxResponseModalComponent,
        TaxCardReadStatusComponent,
    ],
    exports: [
        // shared modules
        LibraryImportsModule,
        UniTickerModule,
        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
        ReportsModule,

        // shared components
        SalaryBalanceListComponent,
        AltinnResponseStatusComponent,
        EmployeeReportPickerListComponent,
        NewRegulativeModalComponent,
        RegulativeUploadModalComponent,
        SalaryBalanceDetailsComponent,
        SalaryBalanceSummaryComponent,
        SalaryTransSupplementModalComponent,
        SyncWagetypesModalComponent,
        RegulativeImportComponent,
        TaxCardModal,

    ],
    providers: [
        EmployeeCategoryService,
        EmployeeOnCategoryService,
        PayrollRunOnCategoryService,
        SalaryBalanceViewService,
        SalarySumsService,
        SalaryTransactionSuggestedValuesService,
        SalaryTransactionSupplementService,
        SalaryTransactionViewService,
        PayrollRunService,
        SalaryYearService,
        EmployeeReportPickerService,
    ]
  })
  export class SalarySharedModule { }
