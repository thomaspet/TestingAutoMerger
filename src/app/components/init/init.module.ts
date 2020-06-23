import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';
import {UniInit} from './init';
import {Login} from './login/login';
import {ConfirmInvite} from './confirmInvite/confirmInvite';
import {RegisterCompany} from './registerCompany/registerCompany';
import {Signup} from './signup/signup';
import {UniPasswordGuide} from './password-guide';
import {NewDemo} from './registerCompany/new-demo/new-demo';
import {UniRecaptcha} from './signup/recaptcha';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,

        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
    ],
    declarations: [
        UniPasswordGuide,
        UniInit,
        Login,
        ConfirmInvite,
        RegisterCompany,
        Signup,
        UniRecaptcha,
        NewDemo
    ]
})
export class InitModule {}
