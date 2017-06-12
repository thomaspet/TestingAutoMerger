import { ProjectOverview } from './overview/overview';
import { ProjectTasks } from './tasks/tasks';

export const routes = [

    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview'
    },
    {
        path: 'overview/:id',
        component: ProjectOverview
    },
    {
        path: 'tasks/:id',
        component: ProjectTasks
    }

];