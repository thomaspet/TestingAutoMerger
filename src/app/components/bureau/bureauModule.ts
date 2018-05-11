import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
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

@NgModule({
    imports: [
        ReactiveFormsModule,
        CommonModule,
        UniFrameworkModule,
        AppCommonModule,
        AppPipesModule,
        LayoutModule,
        RouterModule,
    ],
    declarations: [
        BureauDashboard,
        BureauDetails,
        ...TABS,
        UniNewCompanyModal,
    ],
    providers: [
        BureauCustomHttpService,
        BureauCurrentCompanyService,
    ],
    entryComponents: [
        UniNewCompanyModal,
    ]
})
export class BureauModule {}
