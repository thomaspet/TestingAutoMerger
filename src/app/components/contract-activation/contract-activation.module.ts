import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UniFrameworkModule} from '@uni-framework/frameworkModule';
import {ContractActivation} from './contract-activation';

import {MatCheckboxModule} from '@angular/material';
import {CanDeactivateGuard} from '@app/canDeactivateGuard';

const routes = [{
    path: '',
    pathMatch: 'full',
    component: ContractActivation,
    canDeactivate: [CanDeactivateGuard]
}];

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),
        UniFrameworkModule,
        MatCheckboxModule,
    ],
    declarations: [ContractActivation],
})
export class ContractActivationModule {}
