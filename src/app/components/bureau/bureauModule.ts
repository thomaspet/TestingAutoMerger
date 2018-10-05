import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';
import {LayoutModule} from '../layout/layoutModule';
import {BureauDashboard} from './bureauDashboard';
import {UniNewCompanyModal} from './newCompanyModal';
import {BureauDetails, TABS} from './detailView/bureauDetails';
import {BureauCustomHttpService} from './bureauCustomHttpService';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {RouterModule} from '@angular/router';
import {BureauCurrentCompanyService} from './bureauCurrentCompanyService';
import {GrantAccessModal} from './grant-access-modal/grant-access-modal';
import {GrantAccessSelectionList} from './grant-access-modal/selection-list/selection-list';
import {PAGES} from '@app/components/bureau/grant-access-modal/pages';

import {CompanyGroupModal} from './company-group-modal/company-group-modal';
import {MatStepperModule, MatCheckboxModule, MatButtonModule, MatListModule, MatSelectModule, MatMenuModule} from '@angular/material';

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
        MatMenuModule
    ],
    declarations: [
        GrantAccessSelectionList,
        GrantAccessModal,
        BureauDashboard,
        BureauDetails,
        CompanyGroupModal,
        UniNewCompanyModal,
        ...TABS,
        ...PAGES,
    ],
    providers: [
        BureauCustomHttpService,
        BureauCurrentCompanyService,
    ],
    entryComponents: [
        GrantAccessModal,
        UniNewCompanyModal,
        CompanyGroupModal,
    ]
})
export class BureauModule {}
