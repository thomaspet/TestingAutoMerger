///<reference path="../../node_modules/angular2/typings/browser.d.ts"/>

import {provide} from "angular2/core";
import {bootstrap} from "angular2/platform/browser";
import {HashLocationStrategy, LocationStrategy, ROUTER_PROVIDERS} from "angular2/router";
import {HTTP_PROVIDERS} from "angular2/http";
import {App} from "./app";
import {LayoutHttp} from "../framework/core/http/LayoutHttp";
import {UniHttp} from "../framework/core/http/http";

bootstrap(App, [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    [LayoutHttp, UniHttp],
    provide(LocationStrategy, { useClass: HashLocationStrategy}),
]);
