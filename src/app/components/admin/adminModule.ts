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
import {ApprovalThresholds} from './approvalThresholds/list/approvalThresholds';
import {ApprovalThresholdRules} from './approvalThresholds/details/approvalThresholdRules';
import {SaftExportView} from './jobs/saft/view';
import {SaftImportModal} from './jobs/saft/saftimportmodal';
import {UniGdprPeopleList} from '@app/components/admin/gdpr/gdpr-people-list.component';
import {PeopleService} from '@app/components/admin/gdpr/people.service';
import {GdprFileWriter} from '@app/components/admin/gdpr/gdpr-file-writer';
import {SaftExportModal} from './jobs/saft/saftexportmodal';
import {MatAutocompleteModule, MatSlideToggleModule} from '@angular/material';
import {FlowSettings, FLOW_SETTINGS_TABS} from '@app/components/admin/flow/flowSettings';
import {FlowModal, FLOW_MODAL_PAGES} from '@app/components/admin/flow/flowModals/flowModal';
import {FlowGenericInputModal} from '@app/components/admin/flow/flowGenericInputModal/flowGenericInputModal';

@NgModule({
    entryComponents: [
        SaftImportModal,
        SaftExportModal,
        FlowModal,
        FlowGenericInputModal,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,
        FormsModule,
        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
        AppPipesModule,
        UniQueryModule,
        MatAutocompleteModule,
        MatSlideToggleModule,
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
        ...FLOW_SETTINGS_TABS,
        FlowModal,
        ...FLOW_MODAL_PAGES,
        FlowGenericInputModal,
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
        UniGdprPeopleList
    ]
})
export class AdminModule {}
