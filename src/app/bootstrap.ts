/// <reference path="../../typings/browser/ambient/es6-shim/es6-shim.d.ts"/>
///<reference path="../../node_modules/immutable/dist/immutable.d.ts"/>

import {provide, enableProdMode} from '@angular/core';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {ROUTER_PROVIDERS} from '@angular/router-deprecated';
import {HTTP_PROVIDERS} from '@angular/http';
import {App} from './app';
import {UniHttp} from '../framework/core/http/http';
import {UniState} from '../framework/core/UniState';
import {REPORT_PROVIDERS} from './services/reports/index';
import {IntegrationServerCaller} from './services/common/IntegrationServerCaller';
import {AuthService} from './../framework/core/authService';
import {AccountService, VatTypeService, CurrencyService, CompanySettingsService} from './services/services';
import {ToastService} from '../framework/uniToast/toastService';

declare var window;
if (window.ENV === 'production') {
    enableProdMode();
}

bootstrap(App, [
    // angular providers
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    provide(LocationStrategy, { useClass: HashLocationStrategy}),

    // App providers
    //
    REPORT_PROVIDERS,
    provide(AuthService, {useClass: AuthService}),
    provide(UniHttp, {useClass: UniHttp}),
    provide(UniState, {useClass: UniState}),
    
    // Services
    provide(ToastService, {useClass: ToastService}),
    provide(AccountService, {useClass: AccountService}),
    provide(VatTypeService, {useClass: VatTypeService}),
    provide(CurrencyService, {useClass: CurrencyService}),
    provide(CompanySettingsService, {useClass: CompanySettingsService}),
    provide(IntegrationServerCaller , { useClass: IntegrationServerCaller })
]);
