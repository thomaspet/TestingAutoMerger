import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UniFrameworkModule} from '@uni-framework/frameworkModule';

// import {CanDeactivateGuard} from '@app/canDeactivateGuard';
import {ContractActivation} from './contract-activation';
import {AfterActivationModal} from './after-activation-modal/after-activation-modal';

import {
    MatCheckboxModule, MatStepperModule
} from '@angular/material';

const routes = [{
    path: '',
    pathMatch: 'full',
    component: ContractActivation,
    // canDeactivate: [CanDeactivateGuard]
}];

@NgModule({
    imports: [
        CommonModule,
        HttpModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),
        UniFrameworkModule,

        MatCheckboxModule,
        MatStepperModule
    ],
    declarations: [
        ContractActivation,
        AfterActivationModal
    ],
    entryComponents: [AfterActivationModal]
})
export class ContractActivationModule {}
