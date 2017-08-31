import {DepartmentDetails} from './department/departmentDetails';
import {DepartmentList} from './department/departmentList';

import {Project} from './project/project';
import {ProjectOverview} from './project/overview/overview';
import {ProjectTasks} from './project/tasks/tasks';
import {ProjectEditmode} from './project/editmode/editmode';
import {ProjectDocument} from './project/document/document';
import {ProjectQueryList} from './project/lists/querylist';
import {ProjectHours} from './project/hours/hours';

export const dimensionsRoutes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'projects'
    },
    {
        path: 'departments',
        component: DepartmentList
    },
    {
        path: 'departments/:id',
        component: DepartmentDetails
    },
    {
        path: 'projects',
        component: Project,
        children: [
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
        ]
    }
];
