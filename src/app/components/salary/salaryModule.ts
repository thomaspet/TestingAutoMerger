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
import {EmployeeCategoryButtons} from './employee/employeeCategoryButtons';
import {EmployeeDetails} from './employee/employeeDetails';
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

import {VacationPayModal} from './payrollrun/modals/vacationpay/vacationPayModal';
import {VacationPaySettingsModal} from './payrollrun/modals/vacationpay/vacationPaySettingsModal';
import {ControlModal} from './payrollrun/modals/controlModal';
import {PayrollrunDetails} from './payrollrun/payrollrunDetails';
import {PayrollrunList} from './payrollrun/payrollrunList';
import {PayrollRunDetailsService} from './payrollrun/services/payrollRunDetailsService';
import {PostingSummaryModal} from './payrollrun/modals/postingSummaryModal';
import {PaycheckSending} from './payrollrun/sending/paycheckSending';
import {PaycheckSenderModal} from './payrollrun/sending/paycheckSenderModal';
import {PayrollRunPoster} from './payrollrun/poster/payrollRunPoster';

import {SalaryTransactionSelectionList} from './salarytrans/salarytransactionSelectionList';
import {SalarytransFilterContent} from './salarytrans/salarytransFilter';
import {SalarytransFilter} from './salarytrans/salarytransFilter';
import {SalaryTransactionEmployeeList} from './salarytrans/salarytransList';

import {
    SalaryTransSupplementsModal
} from './modals/salaryTransSupplementsModal';

import {WageTypeView} from './wagetype/wagetypeView';
import {WagetypeDetail} from './wagetype/views/wagetypeDetails';
import {WageTypeSettings} from './wagetype/views/wagetypeSettings';
import {WagetypeList} from './wagetype/wagetypeList';
import {WageTypeViewService} from './wagetype/services/wageTypeViewService'

import {CategoryList} from './category/categoryList';
import {CategoryView} from './category/categoryView';
import {CategoryDetail} from './category/views/categoryDetails';

import {SalarybalanceList} from './salarybalance/salarybalanceList';
import {SalarybalanceView} from './salarybalance/salarybalanceView';
import {SalarybalanceDetail} from './salarybalance/views/salarybalanceDetails';
import {SalaryBalanceSummary} from './salarybalance/summary/salaryBalanceSummary';
import {SalarybalanceLine} from './salarybalance/salarybalanceLine';
import {SalaryBalanceLineModal} from './salarybalance/modals/salBalLineModal';

import {SalaryTransactionSupplementList} from './salaryTransactionSupplement/salaryTransactionSupplementsList';

import {CanDeactivateGuard} from '../../canDeactivateGuard';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,

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
        EmployeeCategoryButtons,
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

        // Payrollrun
        VacationPayModal,
        VacationPaySettingsModal,
        ControlModal,
        PayrollrunDetails,
        PayrollrunList,
        PostingSummaryModal,
        PaycheckSending,
        PaycheckSenderModal,
        PayrollRunPoster,

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
        SalarybalanceList,
        SalarybalanceView,
        SalarybalanceDetail,
        SalaryBalanceSummary,
        SalarybalanceLine,
        SalaryBalanceLineModal
    ],
    entryComponents: [
        TaxCardModal,
        TaxResponseModal,
        VacationPayModal,
        VacationPaySettingsModal,
        ControlModal,
        PostingSummaryModal,
        SalarytransFilterContent,
        AmeldingTypePickerModal,
        SalarybalanceLine,
        PaycheckSenderModal,
        SalaryTransSupplementsModal,
        SalaryBalanceLineModal
    ],
    providers: [
        CanDeactivateGuard,
        PayrollRunDetailsService,
        WageTypeViewService
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
        EmployeeCategoryButtons,
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

        // Payrollrun
        VacationPayModal,
        VacationPaySettingsModal,
        ControlModal,
        PayrollrunDetails,
        PayrollrunList,
        PostingSummaryModal,
        PaycheckSending,
        PaycheckSenderModal,
        PayrollRunPoster,

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
        SalarybalanceList,
        SalarybalanceView,
        SalarybalanceDetail,
        SalaryBalanceSummary,
        SalarybalanceLine,
        SalaryBalanceLineModal
    ]
})
export class SalaryModule {}
