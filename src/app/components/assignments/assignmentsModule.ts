import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';
import {AppPipesModule} from '../../pipes/appPipesModule';

import {UniAssignments} from './assignments';
import {UniTasks} from './tasks/tasks';
import {UniApprovals} from './approvals/approvals';

// Previews
import {SupplierInvoicePreview} from './previews/supplierInvoicePreview';
import {WorkApprovalPreview} from './previews/workapprovalpreview';

import {MatSlideToggleModule} from '@angular/material';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,

        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
        AppPipesModule,
        MatSlideToggleModule
    ],
    declarations: [
        UniAssignments,
        UniTasks,
        UniApprovals,

        // Previews
        SupplierInvoicePreview,
        WorkApprovalPreview
    ]
})
export class AssignmentsModule {}
