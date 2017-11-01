import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';
import {ReportsModule} from '../reports/reportsModule';

import {UniDimensions} from './uniDimensions';
import {DepartmentDetails} from './department/departmentDetails';
import {DepartmentList} from './department/departmentList';

import {Project} from './project/project';
import {ProjectOverview} from './project/overview/overview';
import {ProjectTasks} from './project/tasks/tasks';
import {ProjectEditmode} from './project/editmode/editmode';
import {ProjectDocument} from './project/document/document';
import {ProjectQueryList} from './project/lists/querylist';
import {ProjectHours} from './project/hours/hours';
import {ProjectHourTotals} from './project/hours/hourtotals';

import {ProjectLite} from './projectLite/projectLite';
import {ProjectLiteDetails} from './projectLite/projectLiteDetails';

export * from './uniDimensions';
export * from './dimensionsRoutes';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,

        UniFrameworkModule,
        LayoutModule,

        // TODO: see if we really need these
        AppCommonModule,
        ReportsModule,
    ],
    declarations: [
        UniDimensions,
        DepartmentDetails,
        DepartmentList,
        Project,
        ProjectOverview,
        ProjectTasks,
        ProjectEditmode,
        ProjectDocument,
        ProjectQueryList,
        ProjectHours,
        ProjectHourTotals,
        ProjectLite,
        ProjectLiteDetails
    ]
})
export class DimensionsModule {}
