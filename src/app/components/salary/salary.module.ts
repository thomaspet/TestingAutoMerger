import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';

import {WidgetModule} from '../widgets/widgetModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';
import {AppPipesModule} from '../../pipes/appPipesModule';
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
import {EmployeeDetailsService} from './employee/services/employeeDetailsService';
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
import {EmployeeSalarybalance} from './employee/employeeSalarybalances/employeeSalarybalance';

import {VacationPayModal} from './payrollrun/modals/vacationpay/vacationPayModal';
import {ControlModal} from './payrollrun/modals/controlModal';
import {PayrollrunDetails} from './payrollrun/payrollrunDetails';
import {PayrollrunList} from './payrollrun/payrollrunList';
import {PayrollRunDetailsService} from './payrollrun/services/payrollRunDetailsService';
import {PostingSummaryModal} from './payrollrun/modals/postingSummaryModal';
import {PaycheckSending} from './payrollrun/sending/paycheckSending';
import {PaycheckSenderModal} from './payrollrun/sending/paycheckSenderModal';

import {SalaryTransactionSelectionList} from './salarytrans/salarytransactionSelectionList';
import {SalarytransFilterContent} from './salarytrans/salarytransFilter';
import {SalarytransFilter} from './salarytrans/salarytransFilter';
import {SalaryTransactionEmployeeList} from './salarytrans/salarytransList';
import {SalaryTransViewService} from './sharedServices/salaryTransViewService';

import {
    SalaryTransSupplementsModal,
    ReconciliationModalComponent,
    ReconciliationResponseModalComponent
} from './modals';

import {WageTypeView} from './wagetype/wagetypeView';
import {WagetypeDetail} from './wagetype/views/wagetypeDetails';
import {WageTypeSettings} from './wagetype/views/wagetypeSettings';
import {WagetypeList} from './wagetype/wagetypeList';
import {WageTypeViewService} from './wagetype/services/wageTypeViewService';

import {CategoryList} from './category/categoryList';
import {CategoryView} from './category/categoryView';
import {CategoryViewService} from './category/services/categoryViewService';
import {CategoryDetail} from './category/views/categoryDetails';

import {SalaryBalanceListContainer} from './salarybalance/salaryBalanceList/salaryBalanceListContainer';
import {SalarybalanceList} from './salarybalance/salaryBalanceList/salarybalanceList';
import {SalarybalanceView} from './salarybalance/salarybalanceView';
import {SalaryBalanceViewService} from './salarybalance/services/salaryBalanceViewService';
import {SalarybalanceDetail} from './salarybalance/views/salarybalanceDetails';
import {SalaryBalanceSummary} from './salarybalance/summary/salaryBalanceSummary';
import {SalarybalanceLine} from './salarybalance/salarybalanceLine';
import {SalaryBalanceLineModal} from './salarybalance/modals/salBalLineModal';

import {SalaryTransactionSupplementList} from './salaryTransactionSupplement/salaryTransactionSupplementsList';

import {CanDeactivateGuard} from '../../canDeactivateGuard';
import { AnnualStatementSenderComponent } from './annualStatement/annual-statement-sender/annual-statement-sender.component';
import { EmployeeReportPickerListComponent } from './common/employee-report-picker-list/employee-report-picker-list.component';
import {
    AnnualStatementSenderContainerComponent
} from './annualStatement/annual-statement-sender-container/annual-statement-sender-container.component';
import {AltinnReceiptListComponent} from './altinnReceiptList/altinn-receipt-list/altinn-receipt-list.component';
import {ReconciliationRequestComponent} from './reconciliation/reconciliation-request/reconciliation-request.component';
import {AltinnErrorHandlerService} from './sharedServices/altinnErrorHandlerService';
import {AltinnResponseStatusComponent} from './common/altinn-response-status/altinn-response-status.component';
import {AltinnOverviewComponent} from './altinnOverview/altinn-overview/altinn-overview.component';
import {AltinnOverviewDetailsComponent} from './altinnOverview/altinn-overview-details/altinn-overview-details.component';
import {AltinnOverviewParser} from './altinnOverview/altinnOverviewParser';
import {TimeTransferComponent} from './payrollrun/modals/time-transfer/time-transfer.component';
import {EmpCanActivateGuard} from './employee/empGuard';
import { TravelComponent } from './travel/travel.component';
import { TravelListComponent } from './travel/travel-list/travel-list.component';
import { TravelDetailsComponent } from './travel/travel-details/travel-details.component';
import { TravelLinesComponent } from './travel/travel-details/travel-lines/travel-lines.component';
import { TravelFilterComponent } from './travel/travel-filter/travel-filter.component';

import {MatSlideToggleModule} from '@angular/material';
import {TraveltypeComponent} from './travel/travel-type/traveltype.component';
import {EmployeeTransTickerComponent} from './employee/employee-trans-ticker/employee-trans-ticker.component';
import {UniTickerModule} from '@app/components/uniticker/uniTickerModule';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        MatSlideToggleModule,
        UniTickerModule,

        RouterModule.forChild(salaryRoutes),

        UniFrameworkModule,
        WidgetModule,
        LayoutModule,
        AppCommonModule,
        AppPipesModule,
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
        EmployeeSalarybalance,

        // Payrollrun
        VacationPayModal,
        ControlModal,
        PayrollrunDetails,
        PayrollrunList,
        PostingSummaryModal,
        PaycheckSending,
        PaycheckSenderModal,
        TimeTransferComponent,

        // Salarytrans
        SalaryTransactionSelectionList,
        SalarytransFilterContent,
        SalarytransFilter,
        SalaryTransactionEmployeeList,
        SalaryTransactionSupplementList,
        SalaryTransSupplementsModal,

        // Wagetype
        WageTypeView,
        WagetypeDetail,
        WagetypeList,
        WageTypeSettings,

        // Category
        CategoryList,
        CategoryView,
        CategoryDetail,

        // Salarybalance
        SalaryBalanceListContainer,
        SalarybalanceList,
        SalarybalanceView,
        SalarybalanceDetail,
        SalaryBalanceSummary,
        SalarybalanceLine,
        SalaryBalanceLineModal,
        AnnualStatementSenderComponent,
        EmployeeReportPickerListComponent,
        AnnualStatementSenderContainerComponent,
        ReconciliationModalComponent,
        AltinnReceiptListComponent,
        ReconciliationRequestComponent,
        AltinnResponseStatusComponent,
        ReconciliationResponseModalComponent,
        AltinnOverviewComponent,
        AltinnOverviewDetailsComponent,


        // Travel
        TraveltypeComponent,
        // Travel
        TravelComponent,
        TravelListComponent,
        TravelDetailsComponent,
        TravelLinesComponent,
        TravelFilterComponent,
        EmployeeTransTickerComponent,
    ],
    entryComponents: [
        TaxCardModal,
        TaxResponseModal,
        VacationPayModal,
        ControlModal,
        PostingSummaryModal,
        SalarytransFilterContent,
        AmeldingTypePickerModal,
        SalarybalanceLine,
        PaycheckSenderModal,
        SalaryTransSupplementsModal,
        SalaryBalanceLineModal,
        ReconciliationModalComponent,
        ReconciliationResponseModalComponent,
        TimeTransferComponent,
    ],
    providers: [
        CanDeactivateGuard,
        PayrollRunDetailsService,
        WageTypeViewService,
        EmployeeDetailsService,
        SalaryBalanceViewService,
        CategoryViewService,
        SalaryTransViewService,
        AltinnErrorHandlerService,
        EmpCanActivateGuard,
        AltinnOverviewParser
    ],
    exports: [
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
        TaxCardReadStatusComponent,
        TaxResponseModal,
        PersonalDetails,
        RecurringPost,
        EmployeeTax,
        EmployeeSalarybalance,
        EmployeeTransTickerComponent,

        // Payrollrun
        VacationPayModal,
        ControlModal,
        PayrollrunDetails,
        PayrollrunList,
        PostingSummaryModal,
        PaycheckSending,
        PaycheckSenderModal,
        TimeTransferComponent,

        // Salarytrans
        SalaryTransactionSelectionList,
        SalarytransFilterContent,
        SalarytransFilter,
        SalaryTransactionEmployeeList,
        SalaryTransactionSupplementList,
        SalaryTransSupplementsModal,

        // Wagetype
        WageTypeView,
        WagetypeDetail,
        WagetypeList,
        WageTypeSettings,

        // Category
        CategoryList,
        CategoryView,
        CategoryDetail,

        // Salarybalance
        // SalaryBalanceListContainer,
        // SalarybalanceList,
        SalarybalanceView,
        SalarybalanceDetail,
        SalaryBalanceSummary,
        SalarybalanceLine,
        SalaryBalanceLineModal,
        AnnualStatementSenderComponent,
        EmployeeReportPickerListComponent,

        // Travel
        TravelComponent,
        TravelListComponent,
        TravelDetailsComponent,
        TravelLinesComponent
    ]
})
export class SalaryModule {}
