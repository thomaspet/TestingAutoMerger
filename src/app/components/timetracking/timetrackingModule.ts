import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';
import {timetrackingRoutes} from './timetrackingRoutes';
import {GenericDetailview} from './genericview/detail';
import {TimeEntry} from './timeentry/timeentry';
import {TimeTableReport} from './timeentry/timetable/timetable';
import {ReportWorkflow} from './timeentry/timetable/pipes';
import {RegtimeTotals} from './timeentry/totals/totals';
import {RegtimeBalance} from './timeentry/balance/balance';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {View} from './worker/relations';
import {WorkerDetailview} from './worker/worker';
import {WorkerListview} from './worker/workers';
import {WorkprofileDetailview} from './workprofile/workprofile';
import {WorkprofileListview} from './workprofile/workprofiles';
import {WorktypeDetailview} from './worktype/worktype';
import {WorktypeListview} from './worktype/worktypes';
import {UniWorkTimeOff} from './timeoff/timeoff';
import {UniTimeOffEdit} from './timeoff/timeoffEdit';
import {UniTimeEditModal} from './timeoff/timeEditModal';
import {View as VacationView} from './timeentry/vacation/vacation';
import {View as WorkBalancesView} from './worker/balances';
import {SideMenu} from './sidemenu/sidemenu';
import {UniTemplateModal} from './components/newtemplatemodal';
import {TeamworkReport} from './components/teamworkreport';
import {TimeApproveModal} from './components/popupapprove';
import {TimeentryImportModal} from './components/file-import-modal';
import {UniApproveTaskModal} from './timeentry/timetable/approvetaskmodal';
import {TimetrackingDashboard} from './timetracking-dashboard';
import {WidgetModule} from '../widgets/widgetModule';
import {UniTickerModule} from '../uniticker/uniTickerModule';
import {EditVacationModal} from './timeentry/vacation/edit-vacation-modal';

import {MatSelectModule} from '@angular/material';
import {MatMenuModule, MatDatepickerModule, MatProgressBarModule} from '@angular/material';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AppPipesModule,
        MatSelectModule,
        MatMenuModule,
        MatDatepickerModule,
        MatProgressBarModule,

        RouterModule.forChild(timetrackingRoutes),

        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
        WidgetModule,
        UniTickerModule
    ],
    declarations: [
        GenericDetailview,
        TimeEntry,
        TimeTableReport,
        RegtimeTotals,
        RegtimeBalance,
        View,
        WorkerDetailview,
        WorkerListview,
        WorkprofileDetailview,
        WorkprofileListview,
        WorktypeDetailview,
        WorktypeListview,
        UniWorkTimeOff,
        UniTimeOffEdit,
        UniTimeEditModal,
        VacationView,
        WorkBalancesView,
        SideMenu,
        UniTemplateModal,
        TeamworkReport,
        TimeApproveModal,
        TimeentryImportModal,
        ReportWorkflow,
        UniApproveTaskModal,
        TimetrackingDashboard,
        EditVacationModal
    ],
    providers: [
        ReportWorkflow,
    ],
    entryComponents: [
        TimeentryImportModal,
        UniTemplateModal,
        TimetrackingDashboard,
        TimeApproveModal,
        UniApproveTaskModal,
        UniTimeEditModal,
        EditVacationModal
    ]
})
export class TimetrackingModule {}
