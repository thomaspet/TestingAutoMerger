import {CanDeactivateGuard} from '../../canDeactivateGuard';
import {JobList} from './jobs/list/jobList';
import {JobDetails} from './jobs/details/jobDetails';
import {JobLog} from './jobs/log/jobLog';
import {ApprovalThresholds} from './approvalThresholds/list/approvalThresholds';
import {UniGdprPeopleList} from '@app/components/admin/gdpr/gdpr-people-list.component';
import {FlowSettings, FLOW_ROUTES} from '@app/components/admin/flow/flowSettings';
import { ImportCentralComponent } from './import-central/import-central.component';
import { ImportCentralLogHistoryComponent } from './import-central/log-history/import-central-log-history';

export const adminRoutes = [
    {
        path: 'admin',
        children: [
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
                path: 'thresholds',
                component: ApprovalThresholds
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
            },
            {
                path: 'import-central',
                component: ImportCentralComponent,
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'import-central-log-history/:id',
                component: ImportCentralLogHistoryComponent,
                canDeactivate: [CanDeactivateGuard]
            },
        ]
    }
];
