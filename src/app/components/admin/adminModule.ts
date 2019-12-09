// Angular imports
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {UniQueryModule} from '../uniquery/uniqueryModule';
import {JobList} from './jobs/list/jobList';
import {JobDetails} from './jobs/details/jobDetails';
import {JobLog} from './jobs/log/jobLog';
import {ApprovalThresholds} from './approvalThresholds/list/approvalThresholds';
import {ApprovalThresholdRules} from './approvalThresholds/details/approvalThresholdRules';
import {SaftExportView} from './jobs/saft/view';
import {SaftImportModal} from './jobs/saft/saftimportmodal';
import {UniGdprPeopleList} from '@app/components/admin/gdpr/gdpr-people-list.component';
import {PeopleService} from '@app/components/admin/gdpr/people.service';
import {GdprFileWriter} from '@app/components/admin/gdpr/gdpr-file-writer';
import {SaftExportModal} from './jobs/saft/saftexportmodal';
import {MatAutocompleteModule, MatSlideToggleModule, MatRadioModule, MatCheckboxModule, MatProgressSpinnerModule, MatProgressBarModule} from '@angular/material';

import {FlowSettings} from './flow/flowSettings';
import {FlowModal} from './flow/flow-modal/flow-modal';
import {FlowList} from './flow/flow-list/flow-list';
import {FlowTemplates} from './flow/templates/templates';
import {FlowTemplateModal} from './flow/flow-template-modal/flow-template-modal';

@NgModule({
    entryComponents: [
        SaftImportModal,
        SaftExportModal,
        FlowTemplateModal,
        FlowModal
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        FormsModule,
        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
        AppPipesModule,
        UniQueryModule,
        MatAutocompleteModule,
        MatSlideToggleModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatCheckboxModule,
        MatProgressBarModule
    ],
    declarations: [
        JobList,
        JobDetails,
        JobLog,
        ApprovalThresholds,
        ApprovalThresholdRules,
        SaftExportView,
        SaftImportModal,
        SaftExportModal,
        UniGdprPeopleList,

        FlowSettings,
        FlowModal,
        FlowTemplateModal,
        FlowList,
        FlowTemplates,
    ],
    providers: [
        PeopleService,
        GdprFileWriter,
    ],
    exports: [
        JobList,
        JobDetails,
        JobLog,
        ApprovalThresholds,
        UniGdprPeopleList,
    ]
})
export class AdminModule {}
