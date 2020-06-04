import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {LibraryImportsModule} from '@app/library-imports.module';

import {WidgetModule} from '../widgets/widgetModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';
import {salaryRoutes} from './salary.routes';
import {SalaryComponent} from './salary.component';
import {AMeldingViewComponent} from './a-melding/a-melding-view.component';
import {AmeldingAgaViewComponent} from './a-melding/aga-view/a-melding-aga-view.component';
import {AmeldingPeriodSummaryViewComponent} from './a-melding/period-summary-view/period-summary-view.component';
import {AmeldingReceiptViewComponent} from './a-melding/a-melding-receipt/receipt-view.component';
import {AmeldingSummaryViewComponent} from './a-melding/a-melding-summary/summary.component';
import {AMeldingTypePickerModalComponent} from './a-melding/modals/a-melding-type-picker-modal.component';
import {ReportsModule} from '../reports/reportsModule';

import {EmployeeDetailsComponent} from './employee/employee-details.component';
import {EmployeeDetailsService} from './employee/shared/services/employee-details.service';
import {EmployeeListComponent} from './employee/employee-list.component';
import {EmployeeLeavesComponent} from './employee/employee-leave/employee-leave.component';
import {EmploymentDetailsComponent} from './employee/employment/employment.details.component';
import {EmploymentComponent} from './employee/employment/employment.component';
import {TaxCardModal} from './employee/modals/tax-card-modal.component';
import {TaxResponseModalComponent} from './employee/modals/tax-response-modal.component';
import {TaxCardReadStatusComponent} from './employee/modals/tax-card-read-status.component';
import {ReadTaxCardComponent} from './employee/modals/read-tax-card.component';
import {TaxCardRequestComponent} from './employee/modals/tax-card-request.component';
import {PersonalDetailsComponent} from './employee/personal-details/personal-details.component';
import {RecurringPostComponent} from './employee/recurring-post/recurring-post.component';
import {EmployeeTaxComponent} from './employee/employee-tax/employee-tax.component';
import {EmployeeOTPComponent} from './employee/employee-otp/employee-otp.component';

import {ControlModalComponent} from './payroll-run/modals/control-modal.component';
import {PayrollRunDetailsComponent} from './payroll-run/payroll-run-details.component';
import {PayrollRunListComponent} from './payroll-run/payroll-run-list.component';
import {PayrollRunDetailsService} from './payroll-run/services/payroll-run-details.service';
import {PostingSummaryModalComponent} from './payroll-run/modals/posting-summary-modal.component';
import {PaycheckSendingComponent} from './payroll-run/sending/paycheck-sending.component';
import {PaycheckSenderModalComponent} from './payroll-run/sending/paycheck-sender-modal.component';
import { VariablePayrollsComponent } from './variable-payrolls/variable-payrolls.component';
import {SalaryTransactionModalComponent} from './variable-payrolls/salary-transaction-modal.component';

import {SalaryTransactionSelectionListComponent} from './payroll-run/salary-transaction/salary-transaction-selection-list.component';
import {SalaryTransactionListComponent} from './payroll-run/salary-transaction/salary-transaction-list.component';
import {SalaryTransactionViewService} from './shared/services/salary-transaction/salary-transaction-view.service';
import {UniFindEmployeeModalComponent} from './payroll-run/salary-transaction/find-employee-modal.component';

import {WageTypeViewComponent} from './wage-type/wage-type-view.component';
import {WageTypeListComponent} from './wage-type/wage-type-list.component';
import {WageTypeViewService} from './wage-type/shared/services/wage-type-view.service';
import {WagetypeSyncGuard} from './wage-type/wage-type-sync.guard';

import { CategoryListComponent } from './category/category-list.component';
import { CategoryViewComponent } from './category/category-view.component';
import { CategoryViewService } from './category/shared/services/category-view.service';
import { CategoryDetailComponent } from './category/views/category-details.component';
import { SalaryTransactionSupplementListComponent } from './salary-transaction-supplement/salary-transaction-supplement-list.component';
import { UniSupplementEditModal } from './salary-transaction-supplement/edit-value-modal.component';

import { AnnualStatementSenderComponent } from './annual-statement/annual-statement-sender/annual-statement-sender.component';
import { EmployeeReportPickerListComponent } from './shared/components/employee-report-picker-list/employee-report-picker-list.component';
import {
    AnnualStatementSenderContainerComponent
} from './annual-statement/annual-statement-sender-container/annual-statement-sender-container.component';
import { AltinnReceiptListComponent } from './a-melding/altinn-receipt-list/altinn-receipt-list.component';
import { AltinnErrorHandlerService } from './a-melding/shared/service/altinn-error-handler.service';
import { AltinnResponseStatusComponent } from './shared/components/altinn-response-status/altinn-response-status.component';
import { TimeTransferComponent } from './payroll-run/modals/time-transfer/time-transfer.component';
import { EmployeeGuard } from './employee/employee.guard';
import { TravelComponent } from './travel/travel.component';
import { TravelListComponent } from './travel/travel-list/travel-list.component';
import { TravelDetailsComponent } from './travel/travel-details/travel-details.component';
import { TravelLinesComponent } from './travel/travel-details/travel-lines/travel-lines.component';
import { TravelFilterComponent } from './travel/travel-filter/travel-filter.component';

import { TravelTypeComponent } from './travel/travel-type/travel-type.component';
import { EmployeeTransTickerComponent } from './employee/employee-trans-ticker/employee-trans-ticker.component';
import { UniTickerModule } from '@app/components/uniticker/uniTickerModule';
import { TravelRejectModalComponent } from './travel/travel-reject-modal/travel-reject-modal.component';
import { OTPExportComponent } from './otp-export/otp-export.component';
import { OTPFilterModalComponent } from './otp-export/otp-filter-modal/otp-filter-modal.component';
import { PaycheckMailOptionsComponent } from './payroll-run/sending/paycheck-mail-options/paycheck-mail-options.component';
import { PeriodAdminModalComponent } from './a-melding/modals/period-admin-modal/period-admin-modal.component';
import {
    AMeldingPeriodSplitViewComponent
} from './a-melding/modals/period-admin-modal/tabViews/a-melding-period-split-view/a-melding-period-split-view.component';
import {
    AMeldingPayrollsPeriodViewComponent
} from './a-melding/modals/period-admin-modal/tabViews/a-melding-payrolls-period-view/a-melding-payrolls-period-view.component';
import { OTPPeriodWagetypeModalComponent } from './otp-export/otp-period-wagetype-modal/otp-period-wagetype-modal.component';
import { SalaryHelperMethodsService } from './payroll-run/services/salary-helper-methods.service';
import { SyncWagetypesModalComponent } from './shared/components/sync-wagetypes-modal/sync-wagetypes-modal.component';
import { RegulativeUploadModalComponent } from './shared/components/regulative-upload-modal/regulative-upload-modal.component';
import { RegulativeGroupListComponent } from './regulative/regulative-group-list.component';
import { StatusAMeldingModalComponent } from '@app/components/salary/a-melding/modals/status-a-melding-modal/status-a-melding-modal.component';
import { MakeAmeldingPaymentModalComponent } from '@app/components/salary/a-melding/modals/make-a-melding-payment-modal/make-a-melding-payment-modal.component';
import { RegulativeImportComponent } from './regulative/regulative-import/regulative-import.component';
import { NewRegulativeModalComponent } from './shared/components/new-regulative-modal/new-regulative-modal.component';
import { RegulativeDetailsComponent } from './regulative/regulative-details/regulative-details.component';
import { NegativeSalaryComponent } from './payroll-run/negative-salary/negative-salary.component';
import { NegativeSalaryModalComponent } from './payroll-run/negative-salary/negative-salary-modal/negative-salary-modal.component';
import { PayrollRunDataService } from './payroll-run/services/payroll-run-data.service';
import { WageTypeDetailsComponent } from './wage-type/wage-type-details/wage-type-details.component';
import { WageTypeSettingsComponent } from './wage-type/wage-type-settings/wage-type-settings.component';
import { BalanceComponent } from './balance/balance.component';
import { SalaryBalanceTemplateListComponent } from './salary-balance-template/salary-balance-template-list/salary-balance-template-list.component';
import { SalaryBalanceTemplateDetailsComponent } from './salary-balance-template/salary-balance-template-details/salary-balance-template-details.component';
import { SalaryBalanceTemplateViewComponent } from './salary-balance-template/salary-balance-template-view.component';
import { SalaryBalanceTemplateEmployeeListComponent } from './salary-balance-template/salary-balance-template-employee-list/salary-balance-template-employee-list.component';
import { SalaryBalanceListContainerComponent } from './balance/salary-balance-list-container/salary-balance-list-container.component';
import { SalaryBalanceListComponent } from './shared/components/salary-balance-list/salary-balance-list.component';
import { SalaryBalanceDetailsComponent } from './shared/components/salary-balance-details/salary-balance-details.component';
import { SalaryBalanceSummaryComponent } from './shared/components/salary-balance-summary/salary-balance-summary.component';
import { SalaryBalanceLineComponent } from './balance/salary-balance-line/salary-balance-line.component';
import { SalaryBalanceLineModalComponent } from './balance/salary-balance-line-modal/salary-balance-line-modal.component';
import { SalaryBalanceComponent } from './employee/salary-balance/salary-balance.component';
import { SalaryBalanceViewService } from './shared/services/salary-balance/salary-balance-view.service';
import { ReconciliationRequestComponent } from './a-melding/reconciliation-request/reconciliation-request.component';
import { SalaryTransSupplementModalComponent } from './shared/components/salary-transaction-supplement-modal/salary-transaction-supplement-modal.component';
import { ReconciliationModalComponent } from './a-melding/reconciliation-modal/reconciliation-modal.component';
import { ReconciliationResponseModalComponent } from './a-melding/reconciliation-response-modal/reconciliation-response-modal.component';
import { RegulativeService } from './regulative/shared/service/regulative.service';
import { RegulativeGroupService } from './regulative/shared/service/regulative-group.service';
import { AnnualStatementService } from './annual-statement/shared/service/annual-statement.service';
import { EmployeeCategoryService } from './shared/services/category/employee-category.service';
import { EmployeeLeaveService } from './employee/shared/services/employee-leave.service';
import { EmployeeOnCategoryService } from './shared/services/category/employee-on-category.service';
import { IncomeService } from './wage-type/shared/services/income.service';
import { OTPExportWageTypeService } from './otp-export/shared/service/otp-export-wagetype.service';
import { PayrollRunOnCategoryService } from './shared/services/category/payroll-run-on-category.service';
import { SalarySumsService } from './shared/services/salary-transaction/salary-sums.service';
import { SalaryTransactionSuggestedValuesService } from './shared/services/salary-transaction/salary-transaction-suggested-values.service';
import { SalaryTransactionSupplementService } from './shared/services/salary-transaction/salary-transaction-supplement.service';
import { TravelLineService } from './travel/shared/service/travel-line.service';
import { TravelTypeService } from './travel/shared/service/travel-type.service';
import { AMeldingService } from './a-melding/shared/service/a-melding.service';

@NgModule({
    imports: [
        LibraryImportsModule,
        UniTickerModule,

        RouterModule.forChild(salaryRoutes),

        UniFrameworkModule,
        WidgetModule,
        LayoutModule,
        AppCommonModule,
        ReportsModule
    ],
    declarations: [
        SalaryComponent,

        // Amelding
        AMeldingViewComponent,
        AmeldingAgaViewComponent,
        AmeldingPeriodSummaryViewComponent,
        AmeldingReceiptViewComponent,
        AmeldingSummaryViewComponent,
        AMeldingTypePickerModalComponent,
        AMeldingPeriodSplitViewComponent,
        AMeldingPayrollsPeriodViewComponent,
        StatusAMeldingModalComponent,
        MakeAmeldingPaymentModalComponent,

        // Employee
        EmployeeListComponent,
        EmployeeDetailsComponent,
        EmployeeLeavesComponent,
        EmploymentDetailsComponent,
        EmploymentComponent,
        TaxCardModal,
        ReadTaxCardComponent,
        TaxCardRequestComponent,
        TaxResponseModalComponent,
        TaxCardReadStatusComponent,
        PersonalDetailsComponent,
        RecurringPostComponent,
        EmployeeTaxComponent,
        EmployeeOTPComponent,

        // Payrollrun
        ControlModalComponent,
        PayrollRunDetailsComponent,
        PayrollRunListComponent,
        PostingSummaryModalComponent,
        PaycheckSendingComponent,
        PaycheckSenderModalComponent,
        TimeTransferComponent,
        VariablePayrollsComponent,
        NegativeSalaryComponent,
        NegativeSalaryModalComponent,

        // Salarytrans
        SalaryTransactionSelectionListComponent,
        SalaryTransactionListComponent,
        SalaryTransactionSupplementListComponent,
        SalaryTransSupplementModalComponent,
        UniFindEmployeeModalComponent,
        SalaryTransactionModalComponent,
        UniSupplementEditModal,

        // Wagetype
        WageTypeViewComponent,
        WageTypeDetailsComponent,
        WageTypeSettingsComponent,
        WageTypeListComponent,
        SyncWagetypesModalComponent,

        // Category
        CategoryListComponent,
        CategoryViewComponent,
        CategoryDetailComponent,

        // Salarybalance
        SalaryBalanceListContainerComponent,
        SalaryBalanceListComponent,
        SalaryBalanceDetailsComponent,
        SalaryBalanceSummaryComponent,
        SalaryBalanceLineComponent,
        SalaryBalanceLineModalComponent,
        AnnualStatementSenderComponent,
        EmployeeReportPickerListComponent,
        AnnualStatementSenderContainerComponent,
        ReconciliationModalComponent,
        AltinnReceiptListComponent,
        ReconciliationRequestComponent,
        AltinnResponseStatusComponent,
        ReconciliationResponseModalComponent,
        SalaryBalanceComponent,

        // Travel
        TravelTypeComponent,
        TravelComponent,
        TravelListComponent,
        TravelDetailsComponent,
        TravelLinesComponent,
        TravelFilterComponent,
        EmployeeTransTickerComponent,
        TravelRejectModalComponent,
        SalaryBalanceTemplateListComponent,
        SalaryBalanceTemplateDetailsComponent,
        SalaryBalanceTemplateViewComponent,
        SalaryBalanceTemplateEmployeeListComponent,

        // OTP
        OTPExportComponent,
        OTPFilterModalComponent,
        PaycheckMailOptionsComponent,
        PeriodAdminModalComponent,
        OTPPeriodWagetypeModalComponent,

        // Regulation
        RegulativeUploadModalComponent,
        RegulativeGroupListComponent,
        RegulativeImportComponent,
        NewRegulativeModalComponent,
        RegulativeDetailsComponent,

        // Balance
        BalanceComponent,
    ],
    providers: [
        PayrollRunDetailsService,
        PayrollRunDataService,
        WageTypeViewService,
        EmployeeDetailsService,
        SalaryBalanceViewService,
        CategoryViewService,
        SalaryTransactionViewService,
        AltinnErrorHandlerService,
        EmployeeGuard,
        SalaryHelperMethodsService,
        WagetypeSyncGuard,
        RegulativeService,
        RegulativeGroupService,
        AMeldingService,
        AnnualStatementService,
        EmployeeCategoryService,
        EmployeeLeaveService,
        EmployeeOnCategoryService,
        IncomeService,
        OTPExportWageTypeService,
        PayrollRunOnCategoryService,
        SalarySumsService,
        SalaryTransactionSuggestedValuesService,
        SalaryTransactionSupplementService,
        TravelLineService,
        TravelTypeService
    ]
})
export class SalaryModule {}
