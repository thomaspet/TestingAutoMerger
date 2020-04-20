import {NgModule} from '@angular/core';
import {LibraryImportsModule} from '@app/library-imports.module';
import {RouterModule, Routes} from '@angular/router';

import {UniFrameworkModule} from '@uni-framework/frameworkModule';
import {AppCommonModule} from '@app/components/common/appCommonModule';
import {LayoutModule} from '@app/components/layout/layoutModule';

import {ApprovalRules} from './approval-rules';
import {InvoiceApprovalRules} from './invoice-approval-rules/invoice-approval-rules';
import {ApprovalRuleModal} from './modals/approval-rule-modal';
import {GlobalApprovalRuleModal} from './modals/global-rules-modal';

import {Substitutes} from './substitutes/substitutes';
import {SubstituteModal} from './modals/substitute-modal/substitute-modal';

const routes: Routes = [{
    path: '',
    component: ApprovalRules,
    children: [
        {
            path: '',
            pathMatch: 'full',
            redirectTo: 'invoice-rules'
        },
        {
            path: 'invoice-rules',
            component: InvoiceApprovalRules
        },
        {
            path: 'substitutes',
            component: Substitutes
        }
    ]
}];

@NgModule({
    imports: [
        LibraryImportsModule,
        RouterModule.forChild(routes),
        AppCommonModule,
        LayoutModule,
        UniFrameworkModule,
    ],
    declarations: [
        ApprovalRules,
        InvoiceApprovalRules,
        ApprovalRuleModal,
        GlobalApprovalRuleModal,
        Substitutes,
        SubstituteModal
    ]
})
export class ApprovalRulesModule {}
