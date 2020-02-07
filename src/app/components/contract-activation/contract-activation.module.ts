import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UniFrameworkModule} from '@uni-framework/frameworkModule';
import {ContractActivation} from './contract-activation';

import {MatCheckboxModule, MatRadioModule, MatProgressSpinnerModule} from '@angular/material';
import {CanDeactivateGuard} from '@app/canDeactivateGuard';
import {CompanyDetailsForm} from './company-details-form/company-details-form';

const routes = [{
    path: '',
    pathMatch: 'full',
    component: ContractActivation,
    canDeactivate: [CanDeactivateGuard]
}];

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),
        UniFrameworkModule,
        MatCheckboxModule,
        MatRadioModule,
        MatProgressSpinnerModule,
    ],
    declarations: [ContractActivation, CompanyDetailsForm],
})
export class ContractActivationModule {}
