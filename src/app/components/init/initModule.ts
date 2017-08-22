import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';
import {routes as InitRoutes} from './initRoutes';
import {LoginModal} from './loginModal';
import {UniInit} from './init';
import {CompanySyncModal} from './companySyncModal';
import {Signup} from './signup/signup';
import {ResetPassword} from './resetPassword/resetPassword';
import {Login} from './login/login';
import {ConfirmInvite} from './confirmInvite/confirmInvite';

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

        InitRoutes
    ],
    declarations: [
        LoginModal,
        UniInit,
        CompanySyncModal,
        Signup,
        ResetPassword,
        Login,
        ConfirmInvite
    ],
    entryComponents: [
        LoginModal
    ],
    exports: [
        LoginModal,
        UniInit,
        CompanySyncModal,
        Signup,
        ResetPassword,
        Login,
        ConfirmInvite
    ]
})
export class InitModule {}
