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
import {routes as TimetrackingRoutes} from './timetrackingRoutes';
import {UniTimetracking} from './timetracking';
import {GenericDetailview} from './genericview/detail';
import {GenericListView} from './genericview/list';
import {ProjectDetailview} from './project/project';
import {ProjectListview} from './project/projects';
import {RegisterTime} from './regtime/regtime';
import {TimeEntry} from './timeentry/timeentry';
import {RegtimeTools} from './timeentry/tools/tools';
import {RegtimeTotals} from './timeentry/totals/totals';
import {Editable} from './utils/editable/editable';
import {Lookupservice} from './utils/lookup';
import {IsoTimePipe} from './utils/pipes';
import {MinutesToHoursPipe} from './utils/pipes';
import {WorkTypeSystemTypePipe} from './utils/pipes';
import {View} from './worker/relations';
import {WorkerDetailview} from './worker/worker';
import {WorkerListview} from './worker/workers';
import {WorkprofileDetailview} from './workprofile/workprofile';
import {WorkprofileListview} from './workprofile/workprofiles';
import {WorktypeDetailview} from './worktype/worktype';
import {WorktypeListview} from './worktype/worktypes';

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

        // Route module
        TimetrackingRoutes
    ],
    declarations: [
        UniTimetracking,
        GenericDetailview,
        GenericListView,
        ProjectDetailview,
        ProjectListview,
        RegisterTime,
        TimeEntry,
        RegtimeTools,
        RegtimeTotals,
        Editable,
        IsoTimePipe,
        MinutesToHoursPipe,
        WorkTypeSystemTypePipe,
        View,
        WorkerDetailview,
        WorkerListview,
        WorkprofileDetailview,
        WorkprofileListview,
        WorktypeDetailview,
        WorktypeListview
    ],
    providers: [
        Lookupservice,

    ],
    exports: [
        UniTimetracking,
        GenericDetailview,
        GenericListView,
        ProjectDetailview,
        ProjectListview,
        RegisterTime,
        TimeEntry,
        RegtimeTools,
        RegtimeTotals,
        Editable,
        IsoTimePipe,
        MinutesToHoursPipe,
        WorkTypeSystemTypePipe,
        View,
        WorkerDetailview,
        WorkerListview,
        WorkprofileDetailview,
        WorkprofileListview,
        WorktypeDetailview,
        WorktypeListview
    ]
})
export class TimetrackingModule {
}
