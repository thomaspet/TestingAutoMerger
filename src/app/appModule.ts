/// <reference path='../../typings/browser/ambient/es6-shim/es6-shim.d.ts'/>
/// <reference path='../../node_modules/immutable/dist/immutable.d.ts'/>

import {enableProdMode, NgModule, ErrorHandler, Inject} from '@angular/core';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {COMPILER_PROVIDERS} from '@angular/compiler';
import {UniTableModule} from 'unitable-ng2/main';
import {UniFormModule} from 'uniform-ng2/main';
import {APP_ROUTES} from './routes';
import {App} from './app';

import moment from 'moment';
import 'moment/locale/nb';

import {AppPipesModule} from './pipes/appPipesModule';
import {UniFrameworkModule} from '../framework/frameworkModule';
import {AppServicesModule} from './services/servicesModule';
import {AuthGuard} from './authGuard';
import {UniMicroAngularInternalErrorHandlerOverride} from './UniErrorHandler';
import {AccountingModule} from './components/accounting/accountingModule';
import {LayoutModule} from './components/layout/layoutModule';
import {AppCommonModule} from './components/common/appCommonModule';
import {Dashboard} from './components/dashboard/dashboard';
import {ReportsModule} from './components/reports/reportsModule';
import {UniQueryModule} from './components/uniquery/uniqueryModule';
import {SalaryModule} from './components/salary/salaryModule';
import {InitModule} from './components/init/initModule';
import {SalesModule} from './components/sales/salesModule';
import {SettingsModule} from './components/settings/settingsModule';
import {TimetrackingModule} from './components/timetracking/timetrackingModule';
import {BankModule} from './components/bank/bankModule';
import {AdminModule} from './components/admin/adminModule';
import {CurrencyModule} from './components/currency/currencyModule';

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
        ReactiveFormsModule,
        HttpModule,
        RouterModule,

        // routes
        APP_ROUTES,

        // UNITABLE
        UniTableModule,

        // UNIFORM
        UniFormModule,

        // FRAMEWORK MODULE
        UniFrameworkModule,

        // COMMON MODULES
        LayoutModule,
        AppCommonModule,
        AppPipesModule,
        AppServicesModule,

        // APP MODULES
        AccountingModule,
        ReportsModule,
        SalaryModule,
        InitModule,
        SalesModule,
        SettingsModule,
        TimetrackingModule,
        UniQueryModule,
        BankModule,
        AdminModule,
        CurrencyModule
    ],
    declarations: [
        App,
        Dashboard
    ],
    bootstrap: [App],
    providers: [
        AuthGuard,
        COMPILER_PROVIDERS,
        {provide: LocationStrategy, useClass: HashLocationStrategy},
        {provide: ErrorHandler, useClass: UniMicroAngularInternalErrorHandlerOverride}
    ]
})
export class AppModule {
}

platformBrowserDynamic().bootstrapModule(AppModule);
