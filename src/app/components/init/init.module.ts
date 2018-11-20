import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';
import {LoginModal} from './index';
import {UniInit} from './init';
import {ResetPassword} from './resetPassword/resetPassword';
import {Login} from './login/login';
import {ConfirmInvite} from './confirmInvite/confirmInvite';
import {Signup} from './signup/signup';
import {UniPasswordGuide} from './password-guide';
import {RECAPTCHA_SETTINGS, RecaptchaSettings, RecaptchaLoaderService, RecaptchaModule, } from 'ng-recaptcha';
import {RecaptchaFormsModule} from 'ng-recaptcha/forms';
import {environment} from 'src/environments/environment';

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
        RecaptchaModule.forRoot(),
        RecaptchaFormsModule

    ],
    declarations: [
        UniPasswordGuide,
        LoginModal,
        UniInit,
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
        ResetPassword,
        Login,
        ConfirmInvite
    ],
    providers: [
        {
            provide: RECAPTCHA_SETTINGS,
            useValue: { siteKey: environment.SITE_KEY },
        }
    ],
})
export class InitModule {}
