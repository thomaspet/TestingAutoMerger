import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {LibraryImportsModule} from '@app/library-imports.module';
import {UniFrameworkModule} from '@uni-framework/frameworkModule';
import {ContractActivation} from './contract-activation';

import {CanDeactivateGuard} from '@app/canDeactivateGuard';
import {CompanyDetailsForm} from './company-details-form/company-details-form';
import {AppCommonModule} from '../common/appCommonModule';

const routes = [{
    path: '',
    pathMatch: 'full',
    component: ContractActivation,
    canDeactivate: [CanDeactivateGuard]
}];

@NgModule({
    imports: [
        LibraryImportsModule,
        RouterModule.forChild(routes),
        UniFrameworkModule,
        AppCommonModule,
    ],
    declarations: [ContractActivation, CompanyDetailsForm],
})
export class ContractActivationModule {}
