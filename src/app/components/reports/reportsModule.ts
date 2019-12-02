///<reference path='modals/resultAndBalance/ResultAndBalanceReportFilterModal.ts'/>
// Angular imports
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material';
import {RouterModule} from '@angular/router';

// App imports
import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';
import {AppPipesModule} from '../../pipes/appPipesModule';

// routes
import {BalanceReportFilterForm} from './modals/balanceList/BalanceReportFilterModal';
import {BalanceReportFilterModal} from './modals/balanceList/BalanceReportFilterModal';

import {UniPreviewModal} from './modals/preview/previewModal';
import {UniPrintModal} from './modals/print/printModal';

import {ResultAndBalanceReportFilterForm} from './modals/resultAndBalance/ResultAndBalanceReportFilterModal';
import {ResultAndBalanceReportFilterModal} from './modals/resultAndBalance/ResultAndBalanceReportFilterModal';
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
import { UniReportComments } from '@app/components/reports/modals/parameter/reportComments';
import { UniReportSendModal } from '@app/components/reports/modals/parameter/reportSendModal';

import {MatProgressBarModule} from '@angular/material';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        MatCheckboxModule,
        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
        AppPipesModule,
        MatProgressBarModule
    ],
    declarations: [
        UniReports,
        BalanceReportFilterForm,
        BalanceReportFilterModal,
        UniPreviewModal,
        ResultAndBalanceReportFilterForm ,
        ResultAndBalanceReportFilterModal,
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
        UniReportComments,
        UniReportSendModal,
    ],
    entryComponents: [
        BalanceReportFilterForm,
        ResultAndBalanceReportFilterForm,
        SalaryPaymentListReportFilterModalContent,
        VacationPayBaseReportFilterModalContent,
        SalaryWithholdingAndAGAReportFilterModalContent,
        PaycheckReportFilterModalContent,
        AnnualSatementReportFilterModalComponent,
        UniReportParamsModal,
        UniPreviewModal,
        UniPrintModal,
        UniReportComments,
        UniReportSendModal,
    ],
    exports: [
        UniReports,
        BalanceReportFilterForm,
        BalanceReportFilterModal,
        UniPreviewModal,
        ResultAndBalanceReportFilterForm ,
        ResultAndBalanceReportFilterModal,
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
    ]
})
export class ReportsModule {}
