// Angular imports
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';

import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {UniQueryModule} from '../uniquery/uniqueryModule';

import {JobList} from './jobs/list/jobList';
import {JobDetails} from './jobs/details/jobDetails';
import {JobLog} from './jobs/log/jobLog';
import {UniModels} from './models/models';
import {UniRoles} from './roles/roles';
import {PermissionSelector} from './roles/permissionSelector';
import {ApprovalThresholds} from './approvalThresholds/list/approvalThresholds';
import {ApprovalThresholdRules} from './approvalThresholds/details/approvalThresholdRules';
import {SaftExportView} from './jobs/saft/view';
import {SaftImportModal} from './jobs/saft/saftimportmodal';
import { UniGdprPeopleList } from '@app/components/admin/gdpr/gdpr-people-list.component';
import { PeopleService } from '@app/components/admin/gdpr/people.service';

@NgModule({
    entryComponents: [
        SaftImportModal
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,

        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
        AppPipesModule,
        UniQueryModule,
    ],
    declarations: [
        JobList,
        JobDetails,
        JobLog,
        UniModels,
        UniRoles,
        PermissionSelector,
        ApprovalThresholds,
        ApprovalThresholdRules,
        SaftExportView,
        SaftImportModal,
        UniGdprPeopleList
    ],
    providers: [
        PeopleService
    ],
    exports: [
        JobList,
        JobDetails,
        JobLog,
        UniModels,
        UniRoles,
        PermissionSelector,
        ApprovalThresholds,
        UniGdprPeopleList
    ]
})
export class AdminModule {}
