/// <reference path="../../typings/browser/ambient/es6-shim/es6-shim.d.ts"/>

import {provide} from "@angular/core";
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {bootstrap} from "@angular/platform-browser-dynamic";
import {ROUTER_PROVIDERS} from "@angular/router-deprecated";
import {HTTP_PROVIDERS} from "@angular/http";
import {App} from "./app";
import {UniHttp} from "../framework/core/http/http";
import {UniState} from '../framework/core/UniState';

bootstrap(App, [
    // angular providers
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    provide(LocationStrategy, { useClass: HashLocationStrategy}),

    // App providers
    provide(UniHttp, {useClass: UniHttp}),
    provide(UniState, {useClass: UniState})
]);
