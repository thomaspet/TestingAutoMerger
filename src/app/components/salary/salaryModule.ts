import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';

import {WidgetModule} from '../widgets/widgetModule';
import {UniTableModule} from '../../../framework/ui/unitable/index';
import {UniFormModule} from '../../../framework/ui/uniform/index';
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
import {SelectAmeldingTypeModalContent} from './amelding/modals/selectAmeldingTypeModal';
import {SelectAmeldingTypeModal} from './amelding/modals/selectAmeldingTypeModal';
import {ReportsModule} from '../reports/reportsModule';

import {UniEmployee} from './employee/employee';
import {EmployeeCategoryButtons} from './employee/employeeCategoryButtons';
import {EmployeeDetails} from './employee/employeeDetails';
import {EmployeeList} from './employee/employeeList';
import {EmployeeLeaves} from './employee/employeeLeave/employeeLeave';
import {EmploymentDetails} from './employee/employments/employmentDetails';
import {Employments} from './employee/employments/employments';
import {TaxCardModal, TaxCardModalContent} from './employee/modals/taxCardModal';
import {AltinnResponseModal, AltinnResponseModalContent} from './employee/modals/altinnResponseModal';
import {ReadTaxCard} from './employee/modals/readTaxCard';
import {TaxCardRequest} from './employee/modals/taxCardRequest';
import {PersonalDetails} from './employee/personalDetails/personalDetails';
import {RecurringPost} from './employee/recurringPost/recurringPost';
import {EmployeeTax} from './employee/employeeTax/employeeTax';

import {VacationpayModal} from './payrollrun/vacationpay/vacationPayModal';
import {VacationpayModalContent} from './payrollrun/vacationpay/vacationPayModalContent';
import {VacationpaySettingModal} from './payrollrun/vacationpay/vacationPaySettingModal';
import {VacationpaySettingModalContent} from './payrollrun/vacationpay/vacationpaySettingModalContent';
import {ControlModalContent} from './payrollrun/controlModal';
import {ControlModal} from './payrollrun/controlModal';
import {PayrollrunDetails} from './payrollrun/payrollrunDetails';
import {PayrollrunList} from './payrollrun/payrollrunList';
import {PostingsummaryModal} from './payrollrun/postingsummaryModal';
import {PostingsummaryModalContent} from './payrollrun/postingsummaryModalContent';
import {PaycheckSending} from './payrollrun/sending/paycheckSending';
import {PaycheckSendingModal, PaycheckSendingModalContent} from './payrollrun/sending/paycheckSendingModal';
import { PayrollRunPoster } from './payrollrun/poster/payrollRunPoster';

import {SalaryTransactionSelectionList} from './salarytrans/salarytransactionSelectionList';
import {SalarytransFilterContent} from './salarytrans/salarytransFilter';
import {SalarytransFilter} from './salarytrans/salarytransFilter';
import {SalaryTransactionEmployeeList} from './salarytrans/salarytransList';

import {
    SalaryTransactionSupplementsModal,
    SalaryTransactionSupplementsModalContent
} from './modals/salaryTransactionSupplementsModal';

import {WageTypeView} from './wagetype/wagetypeView';
import {WagetypeDetail} from './wagetype/views/wagetypeDetails';
import {WageTypeSettings} from './wagetype/views/wagetypeSettings';
import {WagetypeList} from './wagetype/wagetypeList';

import {CategoryList} from './category/categoryList';
import {CategoryView} from './category/categoryView';
import {CategoryDetail} from './category/views/categoryDetails';

import {SalarybalanceList} from './salarybalance/salarybalanceList';
import {SalarybalanceView} from './salarybalance/salarybalanceView';
import {SalarybalanceDetail} from './salarybalance/views/salarybalanceDetails';
import {SalaryBalanceSummary} from './salarybalance/summary/salaryBalanceSummary';
import {SalarybalanceLine} from './salarybalance/salarybalanceLine';
import {SalarybalancelineModal, SalarybalancelineModalContent} from './salarybalance/modals/salarybalancelinemodal';

import {SalaryTransactionSupplementList} from './salaryTransactionSupplement/salaryTransactionSupplementsList';
import {UniSearchModule} from '../../../framework/ui/unisearch/index';

import {CanDeactivateGuard} from '../../canDeactivateGuard';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,

        RouterModule.forChild(salaryRoutes),

        WidgetModule,
        UniTableModule,
        UniFormModule,
        UniFrameworkModule,

        LayoutModule,
        AppCommonModule,
        AppPipesModule,
        ReportsModule,

        UniSearchModule

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
        SelectAmeldingTypeModalContent,
        SelectAmeldingTypeModal,

        // Employee
        UniEmployee,
        EmployeeCategoryButtons,
        EmployeeList,
        EmployeeDetails,
        EmployeeLeaves,
        EmploymentDetails,
        Employments,
        TaxCardModal,
        TaxCardModalContent,
        ReadTaxCard,
        TaxCardRequest,
        AltinnResponseModal,
        AltinnResponseModalContent,
        PersonalDetails,
        RecurringPost,
        EmployeeTax,

        // Payrollrun
        VacationpayModal,
        VacationpayModalContent,
        VacationpaySettingModal,
        VacationpaySettingModalContent,
        ControlModalContent,
        ControlModal,
        PayrollrunDetails,
        PayrollrunList,
        PostingsummaryModal,
        PostingsummaryModalContent,
        PaycheckSending,
        PaycheckSendingModal,
        PaycheckSendingModalContent,
        PayrollRunPoster,

        // Salarytrans
        SalaryTransactionSelectionList,
        SalarytransFilterContent,
        SalarytransFilter,
        SalaryTransactionEmployeeList,
        SalaryTransactionSupplementsModal,
        SalaryTransactionSupplementsModalContent,
        SalaryTransactionSupplementList,

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
        SalarybalancelineModal,
        SalarybalancelineModalContent
    ],
    entryComponents: [
        TaxCardModalContent,
        AltinnResponseModalContent,
        VacationpayModalContent,
        VacationpaySettingModalContent,
        ControlModalContent,
        PostingsummaryModalContent,
        SalarytransFilterContent,
        SelectAmeldingTypeModalContent,
        SalaryTransactionSupplementsModalContent,
        SalarybalancelineModalContent,
        SalarybalanceLine,
        PaycheckSendingModalContent
    ],
    providers: [
        CanDeactivateGuard
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
        SelectAmeldingTypeModalContent,
        SelectAmeldingTypeModal,

        // Employee
        UniEmployee,
        EmployeeCategoryButtons,
        EmployeeList,
        EmployeeDetails,
        EmployeeLeaves,
        EmploymentDetails,
        Employments,
        TaxCardModal,
        TaxCardModalContent,
        ReadTaxCard,
        TaxCardRequest,
        AltinnResponseModal,
        AltinnResponseModalContent,
        PersonalDetails,
        RecurringPost,
        EmployeeTax,

        // Payrollrun
        VacationpayModal,
        VacationpayModalContent,
        VacationpaySettingModal,
        VacationpaySettingModalContent,
        ControlModalContent,
        ControlModal,
        PayrollrunDetails,
        PayrollrunList,
        PostingsummaryModal,
        PostingsummaryModalContent,
        PaycheckSending,
        PayrollRunPoster,

        // Salarytrans
        SalaryTransactionSelectionList,
        SalarytransFilterContent,
        SalarytransFilter,
        SalaryTransactionEmployeeList,
        SalaryTransactionSupplementsModal,
        SalaryTransactionSupplementsModalContent,
        SalaryTransactionSupplementList,

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
        SalarybalancelineModal,
        SalarybalancelineModalContent
    ]
})
export class SalaryModule {}
