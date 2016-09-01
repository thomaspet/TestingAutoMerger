/// <reference path="../../typings/browser/ambient/es6-shim/es6-shim.d.ts"/>
///<reference path="../../node_modules/immutable/dist/immutable.d.ts"/>

import { enableProdMode, NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { COMPILER_PROVIDERS } from '@angular/compiler';
import { APP_ROUTES } from './routes';
import { APP_SERVICES } from './app.providers';
import { App } from './app';

import moment from 'moment';
import 'moment/locale/nb';

// Set moment locale
// TODO: Allow users to change this during runtime
moment.locale('nb');

declare var window;
if (window.ENV === 'production') {
    enableProdMode();
}

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        APP_ROUTES
    ],
    declarations: [App],
    bootstrap: [App],
    providers: [
        COMPILER_PROVIDERS,
        APP_SERVICES,
        {provide: LocationStrategy, useClass: HashLocationStrategy},
    ]
})
export class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule);
