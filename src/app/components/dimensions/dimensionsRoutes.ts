import {Project} from './project/project';
import {ProjectOverview} from './project/overview/overview';
import {ProjectTasks} from './project/tasks/tasks';
import {ProjectEditmode} from './project/editmode/editmode';
import {ProjectDocument} from './project/document/document';
import {ProjectQueryList} from './project/lists/querylist';
import {ProjectHourTotals} from './project/hours/hourtotals';

import {UniDimensionView} from './custom/dimension';
import {ProjectSupplierInvoiceList} from './project/lists/supplier-invoice-list/supplier-invoice-list';

export const dimensionsRoutes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'projects'
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
                component: ProjectSupplierInvoiceList
            }
        ]
    }
];
