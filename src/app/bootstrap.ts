/// <reference path="../../typings/browser/ambient/es6-shim/es6-shim.d.ts"/>
///<reference path="../../node_modules/immutable/dist/immutable.d.ts"/>

import {enableProdMode} from '@angular/core';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {HTTP_PROVIDERS} from '@angular/http';
import {APP_ROUTES_PROVIDER} from './routes';
import {APP_SERVICES} from './app.providers';
import {App} from './app';

import moment from 'moment';
import 'moment/locale/nb';

// Set moment locale
// TODO: Allow users to change this during runtime
moment.locale('nb');

declare var window;
if (window.ENV === 'production') {
    enableProdMode();
}

bootstrap(App, [
    HTTP_PROVIDERS,
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    APP_ROUTES_PROVIDER,
    APP_SERVICES

])
.catch(error => console.error(error));
