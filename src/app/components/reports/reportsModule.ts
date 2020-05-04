import {NgModule} from '@angular/core';
import {LibraryImportsModule} from '@app/library-imports.module';

import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';

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


@NgModule({
    imports: [
        LibraryImportsModule,
        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
    ],
    declarations: [
        UniReports,
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
    exports: [
        UniReports,
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
