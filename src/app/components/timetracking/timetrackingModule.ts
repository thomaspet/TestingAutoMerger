import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {UniTableModule} from 'unitable-ng2/main';
import {UniFormModule} from 'uniform-ng2/main';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';
import {timetrackingRoutes} from './timetrackingRoutes';
import {UniTimetracking} from './timetracking';
import {GenericDetailview} from './genericview/detail';
import {GenericListView} from './genericview/list';
import {TimeEntry} from './timeentry/timeentry';
import {TimeTableReport} from './timeentry/timetable/timetable';
import {RegtimeTotals} from './timeentry/totals/totals';
import {RegtimeBalance} from './timeentry/balance/balance';
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
import {View as VacationView} from './timeentry/vacation/vacation';
import {View as WorkBalancesView} from './worker/balances';
import {CanDeactivateGuard} from '../../canDeactivateGuard';
import {WorkEditor} from './components/workeditor';
import {DayBrowser} from './components/daybrowser';
import {UniTimeModal} from './components/popupeditor';
import {TeamworkReport} from './components/teamworkreport';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,

        RouterModule.forChild(timetrackingRoutes),

        UniTableModule,
        UniFormModule,
        UniFrameworkModule,

        LayoutModule,
        AppCommonModule,
    ],
    declarations: [
        UniTimetracking,
        GenericDetailview,
        GenericListView,
        TimeEntry,
        TimeTableReport,
        RegtimeTotals,
        RegtimeBalance,
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
        WorktypeListview,
        VacationView,
        WorkBalancesView,
        WorkEditor,
        DayBrowser,
        UniTimeModal,
        TeamworkReport
    ],  
    providers: [
        Lookupservice,
        CanDeactivateGuard
    ],
    exports: [
        UniTimetracking,
        GenericDetailview,
        GenericListView,
        TimeEntry,
        TimeTableReport,
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
        WorktypeListview,
        VacationView
    ]
})
export class TimetrackingModule {
}
