import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {LibraryImportsModule} from '@app/library-imports.module';

import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';

import {UniAssignments} from './assignments';
import {UniTasks} from './tasks/tasks';
import {UniApprovals} from './approvals/approvals';

import {SupplierInvoicePreview} from './previews/supplierInvoicePreview';
import {WorkApprovalPreview} from './previews/workapprovalpreview';

const routes = [
    {
        path: '',
        component: UniAssignments,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'approvals'
            },
            {
                path: 'tasks',
                component: UniTasks,
            },
            {
                path: 'tasks/:id',
                component: UniTasks,
            },
            {
                path: 'approvals',
                component: UniApprovals,
            },
            {
                path: 'approvals/:id',
                component: UniApprovals,
            }
        ]
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        LibraryImportsModule,
        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
    ],
    declarations: [
        UniAssignments,
        UniTasks,
        UniApprovals,

        SupplierInvoicePreview,
        WorkApprovalPreview
    ]
})
export class AssignmentsModule {}
