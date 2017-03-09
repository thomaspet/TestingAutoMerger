/// <reference path="../../typings/index.d.ts" />
/// <reference path='../../node_modules/immutable/dist/immutable.d.ts' />

import {enableProdMode, NgModule, ErrorHandler} from '@angular/core';
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

import * as moment from 'moment';
import 'moment/locale/nb';

import {TabService} from './components/layout/navbar/tabstrip/tabService';
import {ToastService} from '../framework/uniToast/toastService';

import {UniFrameworkModule} from '../framework/frameworkModule';
import {AuthGuard} from './authGuard';
import {UniMicroAngularInternalErrorHandlerOverride} from './UniErrorHandler';
import {UniQueryModule} from './components/uniquery/uniqueryModule';
import {LayoutModule} from './components/layout/layoutModule';
import {AppCommonModule} from './components/common/appCommonModule';
import {Dashboard} from './components/dashboard/dashboard';
import {ReportsModule} from './components/reports/reportsModule';
import {InitModule} from './components/init/initModule';
import {BankModule} from './components/bank/bankModule';
import {AdminModule} from './components/admin/adminModule';
import {CurrencyModule} from './components/currency/currencyModule';
import {UniTickerModule} from './components/uniticker/uniTickerModule';

// TODO: REVISIT SERVICES (we probably dont need all to be singletons)
import {AccountingServicesModule} from './services/accountingServicesModule';
import {CommonServicesModule} from './services/commonServicesModule';
import {ReportServicesModule} from './services/reportServicesModule';
import {SalaryServicesModule} from './services/salaryServicesModule';
import {TimeTrackingServicesModule} from './services/timetrackingServicesModule';
import {SalesServicesModule} from './services/salesServicesModule';
import {CanDeactivateGuard} from './canDeactivateGuard';

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

        // REVISIT SERVICES!
        CommonServicesModule.forRoot(),
        ReportServicesModule.forRoot(),
        AccountingServicesModule.forRoot(),
        SalaryServicesModule.forRoot(),
        SalesServicesModule.forRoot(),
        TimeTrackingServicesModule.forRoot(),

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
        UniQueryModule,
        ReportsModule,
        InitModule,
        AdminModule,
        CurrencyModule,
        UniTickerModule
    ],
    declarations: [
        App,
        Dashboard,
    ],
    bootstrap: [App],
    providers: [
        AuthGuard,
        CanDeactivateGuard,
        TabService,
        ToastService,
        COMPILER_PROVIDERS,
        {provide: LocationStrategy, useClass: HashLocationStrategy},
        {provide: ErrorHandler, useClass: UniMicroAngularInternalErrorHandlerOverride}
    ],
})
export class AppModule {
}

// platformBrowserDynamic().bootstrapModule(AppModule);
