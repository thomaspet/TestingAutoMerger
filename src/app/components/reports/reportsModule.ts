///<reference path='modals/resultAndBalance/ResultAndBalanceReportFilterModal.ts'/>
// Angular imports
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';

// App imports
import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {UniTableModule} from 'unitable-ng2/main';
import {UniFormModule} from 'uniform-ng2/main';
import {AppCommonModule} from '../common/appCommonModule';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {UniQueryModule} from '../uniquery/uniqueryModule';

// routes
import {routes as ReportRoutes} from './reportsRoutes';
import {Overview} from './overview/overview';
import {AccountReportFilterForm} from './modals/account/AccountReportFilterModal';
import {AccountReportFilterModal} from './modals/account/AccountReportFilterModal';
import {BalanceGeneralLedgerFilterForm} from './modals/balanceGeneralLedgerFilter/BalanceGeneralLedgerFilterModal';
import {BalanceGeneralLedgerFilterModal} from './modals/balanceGeneralLedgerFilter/BalanceGeneralLedgerFilterModal';
import {BalanceReportFilterForm} from './modals/balanceList/BalanceReportFilterModal';
import {BalanceReportFilterModal} from './modals/balanceList/BalanceReportFilterModal';
import {CustomerAccountReportFilterForm} from './modals/customerAccountReportFilter/CustomerAccountReportFilterModal';
import {CustomerAccountReportFilterModal} from './modals/customerAccountReportFilter/CustomerAccountReportFilterModal';
import {ParameterModal, ReportparameterModalType} from './modals/parameter/parameterModal';
import {PostingJournalReportFilterForm} from './modals/postingJournal/PostingJournalReportFilterModal';
import {PostingJournalReportFilterModal} from './modals/postingJournal/PostingJournalReportFilterModal';
import {ReportPreviewModalType} from './modals/preview/previewModal';
import {PreviewModal} from './modals/preview/previewModal';
import {ResultAndBalanceReportFilterForm} from './modals/resultAndBalance/ResultAndBalanceReportFilterModal';
import {ResultAndBalanceReportFilterModal} from './modals/resultAndBalance/ResultAndBalanceReportFilterModal';
import {SupplierAccountReportFilterModal} from './modals/supplierAccountReportFilter/SupplierAccountReportFilterModal';
import {SupplierAccountReportFilterForm} from './modals/supplierAccountReportFilter/SupplierAccountReportFilterModal';
import {
    SalaryPaymentListReportFilterModal,
    SalaryPaymentListReportFilterModalContent
} from './modals/salaryPaymentList/salaryPaymentListReportFilterModal';
import {
    VacationPayBaseReportFilterModal,
    VacationPayBaseReportFilterModalContent
} from './modals/vacationPayBase/vacationPayBaseReportFilterModal';
import {
    SalaryWithholdingAndAGAReportFilterModal,
    SalaryWithholdingAndAGAReportFilterModalContent
} from './modals/salaryWithholdingAndAGA/salaryWithholdingAndAGAReportFilterModal';
import {
    PayCheckReportFilterModal,
    PaycheckReportFilterModalContent
} from './modals/paycheck/paycheckReportFilterModal';
import {UniReports} from './reports';

@NgModule({
    imports: [
        // Angular modules
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,

        // UniTable
        UniTableModule,

        // UniFormModule,
        UniFormModule,

        // Framework
        UniFrameworkModule,

        // App Modules
        LayoutModule,
        AppCommonModule,
        AppPipesModule,

        // Route module
        ReportRoutes
    ],
    declarations: [
        UniReports,
        Overview,
        AccountReportFilterForm,
        AccountReportFilterModal,
        BalanceGeneralLedgerFilterForm,
        BalanceGeneralLedgerFilterModal,
        BalanceReportFilterForm,
        BalanceReportFilterModal,
        CustomerAccountReportFilterForm,
        CustomerAccountReportFilterModal,
        ParameterModal,
        PostingJournalReportFilterForm,
        PostingJournalReportFilterModal,
        ReportPreviewModalType,
        PreviewModal,
        ResultAndBalanceReportFilterForm ,
        ResultAndBalanceReportFilterModal,
        SupplierAccountReportFilterForm,
        SupplierAccountReportFilterModal,
        SalaryPaymentListReportFilterModal,
        SalaryPaymentListReportFilterModalContent,
        VacationPayBaseReportFilterModal,
        VacationPayBaseReportFilterModalContent,
        SalaryWithholdingAndAGAReportFilterModal,
        SalaryWithholdingAndAGAReportFilterModalContent,
        PayCheckReportFilterModal,
        PaycheckReportFilterModalContent,
        ReportparameterModalType
    ],
    entryComponents: [
        ReportPreviewModalType,
        BalanceReportFilterForm,
        AccountReportFilterForm,
        BalanceGeneralLedgerFilterForm,
        CustomerAccountReportFilterForm,
        PostingJournalReportFilterForm,
        ResultAndBalanceReportFilterForm,
        SupplierAccountReportFilterForm,
        SalaryPaymentListReportFilterModalContent,
        VacationPayBaseReportFilterModalContent,
        SalaryWithholdingAndAGAReportFilterModalContent,
        PaycheckReportFilterModalContent,
        ReportparameterModalType
    ],
    exports: [
        UniReports,
        Overview,
        AccountReportFilterForm,
        AccountReportFilterModal,
        BalanceGeneralLedgerFilterForm,
        BalanceGeneralLedgerFilterModal,
        BalanceReportFilterForm,
        BalanceReportFilterModal,
        CustomerAccountReportFilterForm,
        CustomerAccountReportFilterModal,
        ParameterModal,
        PostingJournalReportFilterForm,
        PostingJournalReportFilterModal,
        ReportPreviewModalType,
        PreviewModal,
        ResultAndBalanceReportFilterForm ,
        ResultAndBalanceReportFilterModal,
        SupplierAccountReportFilterForm,
        SupplierAccountReportFilterModal,
        SalaryPaymentListReportFilterModal,
        SalaryPaymentListReportFilterModalContent,
        VacationPayBaseReportFilterModal,
        VacationPayBaseReportFilterModalContent,
        SalaryWithholdingAndAGAReportFilterModal,
        SalaryWithholdingAndAGAReportFilterModalContent,
        PayCheckReportFilterModal,
        PaycheckReportFilterModalContent,
        ReportparameterModalType
    ]
})
export class ReportsModule {}
