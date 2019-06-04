import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';
import {LayoutModule} from '../layout/layoutModule';
import {BureauDashboard} from './bureauDashboard';
import {BureauDetails, TABS} from './detailView/bureauDetails';
import {BureauCustomHttpService} from './bureauCustomHttpService';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {RouterModule} from '@angular/router';
import {BureauCurrentCompanyService} from './bureauCurrentCompanyService';
import {CompanyGroupModal} from './company-group-modal/company-group-modal';
import {
    MatButtonModule,
    MatListModule,
    MatSelectModule,
    MatMenuModule,
} from '@angular/material';

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

        MatButtonModule,
        MatListModule,
        MatSelectModule,
        MatMenuModule,
    ],
    declarations: [
        BureauDashboard,
        BureauDetails,
        CompanyGroupModal,
        ...TABS,
    ],
    providers: [
        BureauCustomHttpService,
        BureauCurrentCompanyService,
    ],
    entryComponents: [CompanyGroupModal]
})
export class BureauModule {}
