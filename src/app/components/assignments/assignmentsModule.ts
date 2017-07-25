import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';

import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';
import {AppPipesModule} from '../../pipes/appPipesModule';

import {ROUTES} from './assignmentsRoutes';

import {UniAssignments} from './assignments';
import {UniTasks} from './tasks/tasks';
import {UniApprovals} from './approvals/approvals';

// Previews
import {SupplierInvoicePreview} from './previews/supplierInvoicePreview';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,

        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
        AppPipesModule,

        ROUTES
    ],
    declarations: [
        UniAssignments,
        UniTasks,
        UniApprovals,

        // Previews
        SupplierInvoicePreview
    ]
})
export class AssignmentsModule {}
