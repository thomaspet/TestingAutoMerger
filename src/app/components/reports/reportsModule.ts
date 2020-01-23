import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material';
import {RouterModule} from '@angular/router';

import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';
import {AppPipesModule} from '../../pipes/appPipesModule';

import {UniPreviewModal} from './modals/preview/previewModal';
import {UniPrintModal} from './modals/print/printModal';

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
        UniPreviewModal,
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
        UniPreviewModal,
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
