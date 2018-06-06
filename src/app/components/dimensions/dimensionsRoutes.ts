import {DepartmentDetails} from './department/departmentDetails';
import {DepartmentList} from './department/departmentList';

import {Project} from './project/project';
import {ProjectOverview} from './project/overview/overview';
import {ProjectTasks} from './project/tasks/tasks';
import {ProjectEditmode} from './project/editmode/editmode';
import {ProjectDocument} from './project/document/document';
import {ProjectQueryList} from './project/lists/querylist';
import {ProjectHourTotals} from './project/hours/hourtotals';

import {ProjectLite} from './projectLite/projectLite';
import {ProjectLiteDetails} from './projectLite/projectLiteDetails';

import {UniDimensionView} from './custom/dimension';

export const dimensionsRoutes = [
    {
        path: 'dimensions',
        children: [
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
                path: 'overview/:id',
                component: UniDimensionView
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
                        component: ProjectHourTotals
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
                        path: 'invoices',
                        component: ProjectQueryList
                    },
                    {
                        path: 'orders',
                        component: ProjectQueryList
                    },
                    {
                        path: 'quotes',
                        component: ProjectQueryList
                    },
                    {
                        path: 'supplierinvoices',
                        component: ProjectQueryList
                    }
                ]
            },
            {
                path: 'projectslite',
                component: ProjectLite
            },
            {
                path: 'projectslite/:id',
                component: ProjectLiteDetails
            }
        ]
    }
];
