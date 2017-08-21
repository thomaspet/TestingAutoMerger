import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
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
import {AppPipesModule} from '../../pipes/appPipesModule';

import {View} from './worker/relations';
import {WorkerDetailview} from './worker/worker';
import {WorkerListview} from './worker/workers';
import {WorkprofileDetailview} from './workprofile/workprofile';
import {WorkprofileListview} from './workprofile/workprofiles';
import {WorktypeDetailview} from './worktype/worktype';
import {WorktypeListview} from './worktype/worktypes';
import {View as VacationView} from './timeentry/vacation/vacation';
import { View as WorkBalancesView } from './worker/balances';
import { SideMenu } from './sidemenu/sidemenu';
import {CanDeactivateGuard} from '../../canDeactivateGuard';
import {WorkEditor} from './components/workeditor';
import {DayBrowser} from './components/daybrowser';
import { UniTimeModal } from './components/popupeditor';
import { UniTemplateModal } from './components/newtemplatemodal';
import {TeamworkReport} from './components/teamworkreport';
import {ApproveDetails} from './components/approvedetails';
import {TimeApproveModal} from './components/popupapprove';
import {UniFileImport} from './components/popupfileimport';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        AppPipesModule,
        
        RouterModule.forChild(timetrackingRoutes),

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
        SideMenu,
        DayBrowser,
        UniTimeModal,
        UniTemplateModal
        TeamworkReport,
        ApproveDetails, TimeApproveModal, UniFileImport
    ],
    providers: [
        CanDeactivateGuard
    ],
    exports: [
        UniTimetracking,
        GenericDetailview,
        GenericListView,
        TimeEntry,
        TimeTableReport,
        RegtimeTotals,
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
