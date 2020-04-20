import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {LibraryImportsModule} from '@app/library-imports.module';

import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';

import {Project} from './project/project';
import {ProjectOverview} from './project/overview/overview';
import {ProjectTasks} from './project/tasks/tasks';
import {ProjectEditmode} from './project/editmode/editmode';
import {ProjectDocument} from './project/document/document';
import {ProjectQueryList} from './project/lists/querylist';
import {ProjectHourTotals} from './project/hours/hourtotals';
import {ProjectSupplierInvoiceList} from './project/lists/supplier-invoice-list/supplier-invoice-list';

import {UniDimensionView} from './custom/dimension';
import {dimensionsRoutes} from './dimensionsRoutes';

@NgModule({
    imports: [
        RouterModule.forChild(dimensionsRoutes),
        LibraryImportsModule,
        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
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
