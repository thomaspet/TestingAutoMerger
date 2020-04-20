import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {LibraryImportsModule} from '@app/library-imports.module';

import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';
import {UniQueryModule} from '../uniquery/uniqueryModule';
import {JobList} from './jobs/list/jobList';
import {JobDetails} from './jobs/details/jobDetails';
import {JobLog} from './jobs/log/jobLog';
import {SaftExportView} from './jobs/saft/view';
import {SaftImportModal} from './jobs/saft/saftimportmodal';
import {UniGdprPeopleList} from '@app/components/admin/gdpr/gdpr-people-list.component';
import {PeopleService} from '@app/components/admin/gdpr/people.service';
import {GdprFileWriter} from '@app/components/admin/gdpr/gdpr-file-writer';
import {SaftExportModal} from './jobs/saft/saftexportmodal';

import {FlowSettings, FLOW_ROUTES} from './flow/flowSettings';
import {FlowModal} from './flow/flow-modal/flow-modal';
import {FlowList} from './flow/flow-list/flow-list';
import {FlowTemplates} from './flow/templates/templates';
import {FlowTemplateModal} from './flow/flow-template-modal/flow-template-modal';
import {UniCompanySaftAccountModal} from './jobs/saft/companySaftAccountModal/companySaftAccountModal';
import {CanDeactivateGuard} from '@app/canDeactivateGuard';

const routes = [
    {
        path: 'jobs',
        component: JobList
    },
    {
        path: 'job-details',
        component: JobDetails,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'job-logs',
        component: JobLog,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'gdpr',
        component: UniGdprPeopleList
    },
    {
        path: 'flow',
        component: FlowSettings,
        canDeactivate: [CanDeactivateGuard],
        children: FLOW_ROUTES,
    }
];

@NgModule({
    imports: [
        LibraryImportsModule,
        RouterModule.forChild(routes),
        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
        UniQueryModule,
    ],
    declarations: [
        JobList,
        JobDetails,
        JobLog,
        SaftExportView,
        SaftImportModal,
        UniCompanySaftAccountModal,
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
    ]
})
export class AdminModule {}
