import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';

import {BureauDashboard} from './bureauDashboard';
import {UniNewCompanyModal} from './newCompanyModal';
import {BureauDetails, TABS} from './detailView/bureauDetails';
import {BureauCustomHttpService} from './bureauCustomHttpService';
import {AppPipesModule} from '../../pipes/appPipesModule';

@NgModule({
    imports: [
        ReactiveFormsModule,
        CommonModule,
        UniFrameworkModule,
        AppCommonModule,
        AppPipesModule
    ],
    declarations: [
        BureauDashboard,
        BureauDetails,
        ...TABS,
        UniNewCompanyModal
    ],
    providers: [
        BureauCustomHttpService
    ],
    entryComponents: [
        UniNewCompanyModal
    ]
})
export class BureauModule {}
