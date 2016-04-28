///<reference path="../../node_modules/angular2/typings/browser.d.ts"/>

import {provide} from "angular2/core";
import {bootstrap} from "angular2/platform/browser";
import {ROUTER_PROVIDERS} from "angular2/router";
import {HashLocationStrategy, LocationStrategy} from 'angular2/platform/common';
import {HTTP_PROVIDERS} from "angular2/http";
import {App} from "./app";
import {UniHttp} from "../framework/core/http/http";
import {UniState} from '../framework/core/UniState';

bootstrap(App, [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    [UniHttp],
    provide(LocationStrategy, { useClass: HashLocationStrategy}),
    provide(UniState, {useClass: UniState})
]);
