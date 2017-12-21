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
import {AppCommonModule} from '../common/appCommonModule';
import {AppPipesModule} from '../../pipes/appPipesModule';

// routes
import {routes as ReportRoutes} from './reportsRoutes';
import {AccountReportFilterForm} from './modals/account/AccountReportFilterModal';
import {AccountReportFilterModal} from './modals/account/AccountReportFilterModal';
import {BalanceGeneralLedgerFilterForm} from './modals/balanceGeneralLedgerFilter/BalanceGeneralLedgerFilterModal';
import {BalanceGeneralLedgerFilterModal} from './modals/balanceGeneralLedgerFilter/BalanceGeneralLedgerFilterModal';
import {BalanceReportFilterForm} from './modals/balanceList/BalanceReportFilterModal';
import {BalanceReportFilterModal} from './modals/balanceList/BalanceReportFilterModal';
import {CustomerAccountReportFilterForm} from './modals/customerAccountReportFilter/CustomerAccountReportFilterModal';
import {CustomerAccountReportFilterModal}
    from './modals/customerAccountReportFilter/CustomerAccountReportFilterModal';
import {PostingJournalReportFilterForm} from './modals/postingJournal/PostingJournalReportFilterModal';
import {PostingJournalReportFilterModal} from './modals/postingJournal/PostingJournalReportFilterModal';

import {UniPreviewModal} from './modals/preview/previewModal';
import {UniPrintModal} from './modals/print/printModal';

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

import {AnnualSatementReportFilterModalComponent} from './modals/anualStatement/anualStatementReportFilterModal';
import {UniReports} from './reports';
import {UniReportParamsModal} from './modals/parameter/reportParamModal';
import {
    ReconciliationListParamsModalComponent
} from './modals/reconciliationList/reconciliation-list-params-modal/reconciliation-list-params-modal.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,

        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
        AppPipesModule,

        ReportRoutes
    ],
    declarations: [
        UniReports,
        AccountReportFilterForm,
        AccountReportFilterModal,
        BalanceGeneralLedgerFilterForm,
        BalanceGeneralLedgerFilterModal,
        BalanceReportFilterForm,
        BalanceReportFilterModal,
        CustomerAccountReportFilterForm,
        CustomerAccountReportFilterModal,
        PostingJournalReportFilterForm,
        PostingJournalReportFilterModal,
        UniPreviewModal,
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
        UniPrintModal,
        UniReportParamsModal,
        AnnualSatementReportFilterModalComponent,
        ReconciliationListParamsModalComponent,
    ],
    entryComponents: [
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
        AnnualSatementReportFilterModalComponent,
        UniReportParamsModal,
        UniPreviewModal,
        UniPrintModal,
        ReconciliationListParamsModalComponent,
    ],
    exports: [
        UniReports,
        AccountReportFilterForm,
        AccountReportFilterModal,
        BalanceGeneralLedgerFilterForm,
        BalanceGeneralLedgerFilterModal,
        BalanceReportFilterForm,
        BalanceReportFilterModal,
        CustomerAccountReportFilterForm,
        CustomerAccountReportFilterModal,
        PostingJournalReportFilterForm,
        PostingJournalReportFilterModal,
        UniPreviewModal,
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
        UniReportParamsModal,
        AnnualSatementReportFilterModalComponent,
        ReconciliationListParamsModalComponent,
    ]
})
export class ReportsModule {}
