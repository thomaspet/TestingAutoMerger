import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';
import {UniInit} from './init';
import {InitService} from './init.service';
import {Login} from './login/login';
import {ConfirmInvite} from './confirmInvite/confirmInvite';
import {RegisterCompany} from './registerCompany/registerCompany';
import {Signup} from './signup/signup';
import {UniPasswordGuide} from './password-guide';
import {RECAPTCHA_SETTINGS, RecaptchaModule, } from 'ng-recaptcha';
import {RecaptchaFormsModule} from 'ng-recaptcha/forms';
import {environment} from 'src/environments/environment';
import { MatTooltipModule, MatRadioModule } from '@angular/material';
import {NewCompany} from './registerCompany/new-company/new-company';
import {NewDemo} from './registerCompany/new-demo/new-demo';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterModule,

        MatTooltipModule,
        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
        RecaptchaModule.forRoot(),
        RecaptchaFormsModule,
        MatRadioModule
    ],
    declarations: [
        UniPasswordGuide,
        UniInit,
        Login,
        ConfirmInvite,
        RegisterCompany,
        Signup,
        NewCompany,
        NewDemo
    ],
    exports: [
        UniInit,
        Login,
        RegisterCompany,
        ConfirmInvite
    ],
    providers: [
        InitService,
        {
            provide: RECAPTCHA_SETTINGS,
            useValue: { siteKey: environment.SITE_KEY },
        }
    ],
})
export class InitModule {}
