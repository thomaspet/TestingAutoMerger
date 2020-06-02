import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {LibraryImportsModule} from '@app/library-imports.module';

import {WidgetModule} from '../widgets/widgetModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';
import {salaryRoutes} from './salaryRoutes';
import {UniSalary} from './salary';
import {AMeldingView} from './amelding/ameldingview';
import {AmeldingAgaView} from './amelding/ameldingAga/aga';
import {AmeldingAvstemView} from './amelding/ameldingAvstem/avstem';
import {AmeldingControlView} from './amelding/ameldingControl/control';
import {AmeldingPeriodSummaryView} from './amelding/ameldingPeriod/period';
import {AmeldingReceiptView} from './amelding/ameldingReceipt/receipt';
import {AmeldingSummaryView} from './amelding/ameldingSummary/summary';
import {AmeldingTypePickerModal} from './amelding/modals/ameldingTypePickerModal';
import {ReportsModule} from '../reports/reportsModule';

import {UniEmployee} from './employee/employee';
import {EmployeeDetails} from './employee/employeeDetails';
import {EmployeeDetailsService} from './employee/shared/services/employeeDetailsService';
import {EmployeeList} from './employee/employeeList';
import {EmployeeLeaves} from './employee/employeeLeave/employeeLeave';
import {EmploymentDetails} from './employee/employments/employmentDetails';
import {Employments} from './employee/employments/employments';
import {TaxCardModal} from './employee/modals/taxCardModal';
import {TaxResponseModal} from './employee/modals/taxResponseModal';
import {TaxCardReadStatusComponent} from './employee/modals/taxCardReadStatus';
import {ReadTaxCard} from './employee/modals/readTaxCard';
import {TaxCardRequest} from './employee/modals/taxCardRequest';
import {PersonalDetails} from './employee/personalDetails/personalDetails';
import {RecurringPost} from './employee/recurringPost/recurringPost';
import {EmployeeTax} from './employee/employeeTax/employeeTax';
import {EmployeeOTP} from './employee/employeeOTP/employeeOTP';

import {ControlModal} from './payrollrun/modals/controlModal';
import {PayrollrunDetails} from './payrollrun/payrollrunDetails';
import {PayrollrunList} from './payrollrun/payrollrunList';
import {PayrollRunDetailsService} from './payrollrun/services/payrollrun-details.service';
import {PostingSummaryModal} from './payrollrun/modals/postingSummaryModal';
import {PaycheckSending} from './payrollrun/sending/paycheckSending';
import {PaycheckSenderModal} from './payrollrun/sending/paycheckSenderModal';
import { VariablePayrollsComponent } from './variable-payrolls/variable-payrolls.component';
import {UniSalaryTransactionModal} from './variable-payrolls/editSalaryTransactionModal';

import {SalaryTransactionSelectionList} from './payrollrun/salarytrans/salarytransactionSelectionList';
import {SalaryTransactionEmployeeList} from './payrollrun/salarytrans/salarytransList';
import {SalaryTransViewService} from './shared/services/salary-transaction/salaryTransViewService';
import {UniFindEmployeeModal} from './payrollrun/salarytrans/findEmployeeModal';

import {WageTypeView} from './wagetype/wagetypeView';
import {WagetypeList} from './wagetype/wagetypeList';
import {WageTypeViewService} from './wagetype/shared/services/wageTypeViewService';
import {WagetypeSyncGuard} from './wagetype/wagetypesync.guard';

import { CategoryList } from './category/categoryList';
import { CategoryView } from './category/categoryView';
import { CategoryViewService } from './category/shared/services/categoryViewService';
import { CategoryDetail } from './category/views/categoryDetails';
import { SalaryTransactionSupplementList } from './salaryTransactionSupplement/salaryTransactionSupplementsList';
import { UniSupplementEditModal } from './salaryTransactionSupplement/editValueModal';

import { AnnualStatementSenderComponent } from './annualStatement/annual-statement-sender/annual-statement-sender.component';
import { EmployeeReportPickerListComponent } from './shared/components/employee-report-picker-list/employee-report-picker-list.component';
import {
    AnnualStatementSenderContainerComponent
} from './annualStatement/annual-statement-sender-container/annual-statement-sender-container.component';
import { AltinnReceiptListComponent } from './amelding/altinn-receipt-list/altinn-receipt-list.component';
import { AltinnErrorHandlerService } from './amelding/shared/service/altinnErrorHandlerService';
import { AltinnResponseStatusComponent } from './shared/components/altinn-response-status/altinn-response-status.component';
import { TimeTransferComponent } from './payrollrun/modals/time-transfer/time-transfer.component';
import { EmpCanActivateGuard } from './employee/empGuard';
import { TravelComponent } from './travel/travel.component';
import { TravelListComponent } from './travel/travel-list/travel-list.component';
import { TravelDetailsComponent } from './travel/travel-details/travel-details.component';
import { TravelLinesComponent } from './travel/travel-details/travel-lines/travel-lines.component';
import { TravelFilterComponent } from './travel/travel-filter/travel-filter.component';

import { TraveltypeComponent } from './travel/travel-type/traveltype.component';
import { EmployeeTransTickerComponent } from './employee/employee-trans-ticker/employee-trans-ticker.component';
import { UniTickerModule } from '@app/components/uniticker/uniTickerModule';
import { TravelRejectModal } from './travel/travel-modal/travelRejectModal';
import { OTPExportComponent } from './otpexport/otpexport.component';
import { OtpFilterModalComponent } from './otpexport/otp-filter-modal/otp-filter-modal.component';
import { PaycheckMailOptionsComponent } from './payrollrun/sending/paycheck-mail-options/paycheck-mail-options.component';
import { PeriodAdminModalComponent } from './amelding/modals/period-admin-modal/period-admin-modal.component';
import {
    AmeldingPeriodSplitViewComponent
} from './amelding/modals/period-admin-modal/tabViews/amelding-period-split-view/amelding-period-split-view.component';
import {
    AmeldingPayrollsPeriodViewComponent
} from './amelding/modals/period-admin-modal/tabViews/amelding-payrolls-period-view/amelding-payrolls-period-view.component';
import { OtpPeriodWagetypeModalComponent } from './otpexport/otp-period-wagetype-modal/otp-period-wagetype-modal.component';
import { SalaryHelperMethods } from './payrollrun/services/salaryHelperMethods';
import { SyncWagetypesModalComponent } from './shared/components/sync-wagetypes-modal/sync-wagetypes-modal.component';
import { RegulativeUploadModalComponent } from './shared/components/regulative-upload-modal/regulative-upload-modal.component';
import { RegulativeGroupListComponent } from './regulative/regulative-group-list.component';
import { StatusAMeldingModal } from '@app/components/salary/amelding/modals/statusAMeldingModal/statusAMeldingModal';
import { MakeAmeldingPaymentModal } from '@app/components/salary/amelding/modals/makeAmeldingPaymentModal/makeAmeldingPaymentModal';
import { RegulativeImportComponent } from './regulative/regulative-import/regulative-import.component';
import { NewRegulativeModalComponent } from './shared/components/new-regulative-modal/new-regulative-modal.component';
import { RegulativeDetailsComponent } from './regulative/regulative-details/regulative-details.component';
import { NegativeSalaryComponent } from './payrollrun/negative-salary/negative-salary.component';
import { NegativeSalaryModalComponent } from './payrollrun/negative-salary/negative-salary-modal/negative-salary-modal.component';
import { PayrollRunDataService } from './payrollrun/services/payrollrun-data.service';
import { WageTypeDetailsComponent } from './wagetype/wage-type-details/wage-type-details.component';
import { WageTypeSettingsComponent } from './wagetype/wage-type-settings/wage-type-settings.component';
import { BalanceComponent } from './balance/balance.component';
import { SalarybalanceTemplateListComponent } from './salary-balance-template/salarybalance-template-list/salarybalance-template-list.component';
import { SalarybalanceTemplateDetailsComponent } from './salary-balance-template/salarybalance-template-details/salarybalance-template-details.component';
import { SalarybalanceTemplateView } from './salary-balance-template/salarybalanceTemplateView';
import { SalarybalanceTemplateEmployeeListComponent } from './salary-balance-template/salarybalance-template-employee-list/salarybalance-template-employee-list.component';
import { SalaryBalanceListContainerComponent } from './balance/salary-balance-list-container/salary-balance-list-container.component';
import { SalaryBalanceListComponent } from './shared/components/salary-balance-list/salary-balance-list.component';
import { SalaryBalanceDetailsComponent } from './shared/components/salary-balance-details/salary-balance-details.component';
import { SalaryBalanceSummaryComponent } from './shared/components/salary-balance-summary/salary-balance-summary.component';
import { SalaryBalanceLineComponent } from './balance/salary-balance-line/salary-balance-line.component';
import { SalaryBalanceLineModalComponent } from './balance/salary-balance-line-modal/salary-balance-line-modal.component';
import { SalaryBalanceComponent } from './employee/salary-balance/salary-balance.component';
import { SalaryBalanceViewService } from './shared/services/salary-balance/salaryBalanceViewService';
import { ReconciliationRequestComponent } from './amelding/reconciliation-request/reconciliation-request.component';
import { SalaryTransSupplementsModal } from './shared/components/salaryTransSupplementModal/salaryTransSupplementsModal';
import { ReconciliationModalComponent } from './amelding/reconciliation-modal/reconciliation-modal.component';
import { ReconciliationResponseModalComponent } from './amelding/reconciliation-response-modal/reconciliation-response-modal.component';
import { RegulativeService } from './regulative/shared/service/regulativeService';
import { RegulativeGroupService } from './regulative/shared/service/regulativeGroupService';
import { AnnualStatementService } from './annualStatement/shared/service/annualStatementService';
import { EmployeeCategoryService } from './shared/services/category/employeeCategoryService';
import { EmployeeLeaveService } from './employee/shared/services/employeeLeaveService';
import { EmployeeOnCategoryService } from './shared/services/category/EmployeeOnCategoryService';
import { InntektService } from './wagetype/shared/services/inntektService';
import { OtpExportWagetypesService } from './otpexport/shared/service/otpExportWagetypesService';
import { PayrollRunOnCategoryService } from './shared/services/category/payrollRunOnCategoryService';
import { SalarySumsService } from './shared/services/salary-transaction/salarySumsService';
import { SalaryTransactionSuggestedValuesService } from './shared/services/salary-transaction/salaryTransactionSuggestedValuesService';
import { SupplementService } from './shared/services/salary-transaction/salaryTransactionSupplementService';
import { TravelLineService } from './travel/shared/service/travelLineService';
import { TravelTypeService } from './travel/shared/service/travelTypeService';
import { AMeldingService } from './amelding/shared/service/aMeldingService';

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
        UniSalary,

        // Amelding
        AMeldingView,
        AmeldingAgaView,
        AmeldingAvstemView,
        AmeldingControlView,
        AmeldingPeriodSummaryView,
        AmeldingReceiptView,
        AmeldingSummaryView,
        AmeldingTypePickerModal,
        AmeldingPeriodSplitViewComponent,
        AmeldingPayrollsPeriodViewComponent,
        StatusAMeldingModal,
        MakeAmeldingPaymentModal,

        // Employee
        UniEmployee,
        EmployeeList,
        EmployeeDetails,
        EmployeeLeaves,
        EmploymentDetails,
        Employments,
        TaxCardModal,
        ReadTaxCard,
        TaxCardRequest,
        TaxResponseModal,
        TaxCardReadStatusComponent,
        PersonalDetails,
        RecurringPost,
        EmployeeTax,
        EmployeeOTP,

        // Payrollrun
        ControlModal,
        PayrollrunDetails,
        PayrollrunList,
        PostingSummaryModal,
        PaycheckSending,
        PaycheckSenderModal,
        TimeTransferComponent,
        VariablePayrollsComponent,
        NegativeSalaryComponent,
        NegativeSalaryModalComponent,

        // Salarytrans
        SalaryTransactionSelectionList,
        SalaryTransactionEmployeeList,
        SalaryTransactionSupplementList,
        SalaryTransSupplementsModal,
        UniFindEmployeeModal,
        UniSalaryTransactionModal,
        UniSupplementEditModal,

        // Wagetype
        WageTypeView,
        WageTypeDetailsComponent,
        WageTypeSettingsComponent,
        WagetypeList,
        SyncWagetypesModalComponent,

        // Category
        CategoryList,
        CategoryView,
        CategoryDetail,

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
        TraveltypeComponent,
        TravelComponent,
        TravelListComponent,
        TravelDetailsComponent,
        TravelLinesComponent,
        TravelFilterComponent,
        EmployeeTransTickerComponent,
        TravelRejectModal,
        SalarybalanceTemplateListComponent,
        SalarybalanceTemplateDetailsComponent,
        SalarybalanceTemplateView,
        SalarybalanceTemplateEmployeeListComponent,

        // OTP
        OTPExportComponent,
        OtpFilterModalComponent,
        PaycheckMailOptionsComponent,
        PeriodAdminModalComponent,
        OtpPeriodWagetypeModalComponent,

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
        SalaryTransViewService,
        AltinnErrorHandlerService,
        EmpCanActivateGuard,
        SalaryHelperMethods,
        WagetypeSyncGuard,
        RegulativeService,
        RegulativeGroupService,
        AMeldingService,
        AnnualStatementService,
        EmployeeCategoryService,
        EmployeeLeaveService,
        EmployeeOnCategoryService,
        InntektService,
        OtpExportWagetypesService,
        PayrollRunOnCategoryService,
        SalarySumsService,
        SalaryTransactionSuggestedValuesService,
        SupplementService,
        TravelLineService,
        TravelTypeService
    ]
})
export class SalaryModule {}
