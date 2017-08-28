import { ProjectOverview } from './overview/overview';
import { ProjectTasks } from './tasks/tasks';
import { ProjectEditmode } from './editmode/editmode';
import { ProjectDocument } from './document/document';
import { ProjectQueryList } from './lists/querylist';
import { ProjectHours } from './hours/hours';

export const routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview'
    },
    {
        path: 'overview',
        component: ProjectOverview
    },
    {
        path: 'tasks',
        component: ProjectTasks
    },
    {
        path: 'hours',
        component: ProjectHours
    },
    {
        path: 'editmode',
        component: ProjectEditmode
    },
    {
        path: 'documents',
        component: ProjectDocument
    },
    {
        path: '**',
        component: ProjectQueryList
    }
];
