import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';
import {LayoutModule} from '../layout/layoutModule';
import {BureauDashboard} from './bureauDashboard';
import {BureauDetails, TABS} from './detailView/bureauDetails';
import {BureauCustomHttpService} from './bureauCustomHttpService';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {RouterModule} from '@angular/router';
import {BureauCurrentCompanyService} from './bureauCurrentCompanyService';
import {GrantAccessModal} from './grant-access-modal/grant-access-modal';
import {GrantAccessSelectionList} from './grant-access-modal/selection-list/selection-list';
import {PAGES} from '@app/components/bureau/grant-access-modal/pages';
import {CompanyGroupModal} from './company-group-modal/company-group-modal';
import {
    MatStepperModule,
    MatCheckboxModule,
    MatButtonModule,
    MatListModule,
    MatSelectModule,
    MatMenuModule,
    MatCardModule,
    MatGridListModule,
    MatBadgeModule,
} from '@angular/material';

import {
    UniNewCompanyModal,
    SelectLicenseComponent,
    SelectCompanyComponent,
    SelectTemplate,
    SelectProductsComponent,
    MatBadgeIconDirective,
} from './new-company-modal';

import {DeleteCompanyModal} from './delete-company-modal/delete-company-modal';

@NgModule({
    imports: [
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
        UniFrameworkModule,
        AppCommonModule,
        AppPipesModule,
        LayoutModule,
        RouterModule,

        MatStepperModule,
        MatCheckboxModule,
        MatButtonModule,
        MatListModule,
        MatSelectModule,
        MatMenuModule,
        MatCardModule,
        MatGridListModule,
        MatBadgeModule,
        ScrollingModule,
    ],
    declarations: [
        GrantAccessSelectionList,
        GrantAccessModal,
        BureauDashboard,
        BureauDetails,
        CompanyGroupModal,
        UniNewCompanyModal,
        DeleteCompanyModal,
        ...TABS,
        ...PAGES,
        SelectLicenseComponent,
        SelectCompanyComponent,
        SelectTemplate,
        SelectProductsComponent,
        MatBadgeIconDirective,
    ],
    providers: [
        BureauCustomHttpService,
        BureauCurrentCompanyService,
    ],
    entryComponents: [
        GrantAccessModal,
        UniNewCompanyModal,
        CompanyGroupModal,
        DeleteCompanyModal,
    ]
})
export class BureauModule {}
