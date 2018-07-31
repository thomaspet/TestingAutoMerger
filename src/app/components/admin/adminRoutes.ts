import {CanDeactivateGuard} from '../../canDeactivateGuard';
import {JobList} from './jobs/list/jobList';
import {JobDetails} from './jobs/details/jobDetails';
import {JobLog} from './jobs/log/jobLog';
import {UniModels} from './models/models';
import {UniRoles} from './roles/roles';
import {ApprovalThresholds} from './approvalThresholds/list/approvalThresholds';
import {UniGdprPeopleList} from '@app/components/admin/gdpr/gdpr-people-list.component';

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
                path: 'models',
                component: UniModels,
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'roles',
                component: UniRoles,
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'thresholds',
                component: ApprovalThresholds
            },
            {
                path: 'gdpr',
                component: UniGdprPeopleList
            }
        ]
    }
];
