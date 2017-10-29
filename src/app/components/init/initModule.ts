import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';
import {LoginModal} from './loginModal';
import {UniInit} from './init';
import {CompanySyncModal} from './companySyncModal';
import {ResetPassword} from './resetPassword/resetPassword';
import {Login} from './login/login';
import {ConfirmInvite} from './confirmInvite/confirmInvite';
import {Signup} from './signup/signup';
import {UniPasswordGuide} from './password-guide';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,

        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
    ],
    declarations: [
        UniPasswordGuide,
        LoginModal,
        UniInit,
        CompanySyncModal,
        ResetPassword,
        Login,
        ConfirmInvite,
        Signup
    ],
    entryComponents: [
        LoginModal
    ],
    exports: [
        LoginModal,
        UniInit,
        CompanySyncModal,
        ResetPassword,
        Login,
        ConfirmInvite
    ]
})
export class InitModule {}
