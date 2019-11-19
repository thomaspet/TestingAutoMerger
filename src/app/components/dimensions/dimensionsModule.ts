import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {MatSelectModule} from '@angular/material';

import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';
import {ReportsModule} from '../reports/reportsModule';

import {Project} from './project/project';
import {ProjectOverview} from './project/overview/overview';
import {ProjectTasks} from './project/tasks/tasks';
import {ProjectEditmode} from './project/editmode/editmode';
import {ProjectDocument} from './project/document/document';
import {ProjectQueryList} from './project/lists/querylist';
import {ProjectHourTotals} from './project/hours/hourtotals';
import {ProjectSupplierInvoiceList} from './project/lists/supplier-invoice-list/supplier-invoice-list';

import {UniDimensionView} from './custom/dimension';



@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,

        UniFrameworkModule,
        LayoutModule,
        MatSelectModule,

        // TODO: see if we really need these
        AppCommonModule,
        ReportsModule,
    ],
    declarations: [
        Project,
        ProjectOverview,
        ProjectTasks,
        ProjectEditmode,
        ProjectDocument,
        ProjectQueryList,
        ProjectHourTotals,
        ProjectSupplierInvoiceList,
        UniDimensionView
    ]
})
export class DimensionsModule {}
