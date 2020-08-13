import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {LibraryImportsModule} from '@app/library-imports.module';

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
import {UniTickerModule} from '../uniticker/uniTickerModule';
import {EditVacationModal} from './timeentry/vacation/edit-vacation-modal';
import {HourTotals} from './hourtotals/hourtotals';
import {HourTotalsDrilldownModal} from './hourtotals/drilldown-modal';

@NgModule({
    imports: [
        LibraryImportsModule,

        RouterModule.forChild(timetrackingRoutes),

        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
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
        EditVacationModal,
        HourTotals,
        HourTotalsDrilldownModal
    ],
    providers: [
        ReportWorkflow,
    ]
})
export class TimetrackingModule {}
