import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';

import {UniTableModule} from 'unitable-ng2/main';
import {UniFormModule} from 'uniform-ng2/main';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {AppServicesModule} from '../../services/servicesModule';
import {routes as SalaryRoutes} from './salaryRoutes';
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
import {EmployeeLeave} from './employee/employeeLeave/employeeLeave';
import {EmploymentDetails} from './employee/employments/employmentDetails';
import {Employments} from './employee/employments/employments';
import {TaxCardModal, TaxCardModalContent} from './employee/modals/TaxCardModal';
import {AltinnResponseModal, AltinnResponseModalContent} from './employee/modals/altinnResponseModal';
import {ReadTaxCard} from './employee/modals/readTaxCard';
import {TaxCardRequest} from './employee/modals/taxCardRequest';
import {PersonalDetails} from './employee/personalDetails/personalDetails';
import {RecurringPost} from './employee/recurringPost/recurringPost';

import {VacationpayModal} from './payrollrun/vacationpay/vacationPayModal';
import {VacationpayModalContent} from './payrollrun/vacationpay/vacationPayModalContent';
import {VacationpaySettingModal} from './payrollrun/vacationpay/vacationPaySettingModal';
import {VacationpaySettingModalContent} from './payrollrun/vacationpay/vacationpaySettingModalContent';
import {ControlModalContent} from './payrollrun/controlModal';
import {PaymentList} from './payrollrun/paymentList';
import {ControlModal} from './payrollrun/controlModal';
import {PayrollrunDetails} from './payrollrun/payrollrunDetails';
import {PayrollrunList} from './payrollrun/payrollrunList';
import {PostingsummaryModal} from './payrollrun/postingsummaryModal';
import {PostingsummaryModalContent} from './payrollrun/postingsummaryModalContent';

import {SalaryTransactionSelectionList} from './salarytrans/salarytransactionSelectionList';
import {SalarytransFilterContent} from './salarytrans/salarytransFilter';
import {SalarytransFilter} from './salarytrans/salarytransFilter';
import {SalaryTransactionEmployeeList} from './salarytrans/salarytransList';

import {SalaryTransactionSupplementsModal, SalaryTransactionSupplementsModalContent} from './modals/salaryTransactionSupplementsModal';

import {WageTypeView} from './wagetype/wagetypeView';
import {WagetypeDetail} from './wagetype/views/wagetypeDetails';
import {WageTypeSettings} from './wagetype/views/wagetypeSettings';
import {WageTypeLimitValues} from './wagetype/views/wagetypeLimitValues';
import {WagetypeList} from './wagetype/wagetypeList';
import {CanDeactivateGuard} from '../../canDeactivateGuard';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,

        // UniTable
        UniTableModule,

        // UniForm
        UniFormModule,

        // Framework
        UniFrameworkModule,

        // App Modules
        LayoutModule,
        AppCommonModule,
        AppPipesModule,
        AppServicesModule,
        ReportsModule,

        // routes
        SalaryRoutes
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
        EmployeeLeave,
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

        // Payrollrun
        VacationpayModal,
        VacationpayModalContent,
        VacationpaySettingModal,
        VacationpaySettingModalContent,
        ControlModalContent,
        PaymentList,
        ControlModal,
        PayrollrunDetails,
        PayrollrunList,
        PostingsummaryModal,
        PostingsummaryModalContent,

        // Salarytrans
        SalaryTransactionSelectionList,
        SalarytransFilterContent,
        SalarytransFilter,
        SalaryTransactionEmployeeList,
        SalaryTransactionSupplementsModal,
        SalaryTransactionSupplementsModalContent,

        // Wagetype
        WageTypeView,
        WagetypeDetail,
        WagetypeList,
        WageTypeSettings,
        WageTypeLimitValues
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
        SalaryTransactionSupplementsModalContent
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
        EmployeeLeave,
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

        // Payrollrun
        VacationpayModal,
        VacationpayModalContent,
        VacationpaySettingModal,
        VacationpaySettingModalContent,
        ControlModalContent,
        PaymentList,
        ControlModal,
        PayrollrunDetails,
        PayrollrunList,
        PostingsummaryModal,
        PostingsummaryModalContent,

        // Salarytrans
        SalaryTransactionSelectionList,
        SalarytransFilterContent,
        SalarytransFilter,
        SalaryTransactionEmployeeList,
        SalaryTransactionSupplementsModal,
        SalaryTransactionSupplementsModalContent,

        // Wagetype
        WageTypeView,
        WagetypeDetail,
        WagetypeList,
        WageTypeSettings,
        WageTypeLimitValues
    ]
})
export class SalaryModule {
}
