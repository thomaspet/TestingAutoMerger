import { ProjectOverview } from './overview/overview';
import { ProjectTasks } from './tasks/tasks';
import { ProjectEditmode } from './editmode/editmode';

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
        path: 'editmode',
        component: ProjectEditmode
    }
];