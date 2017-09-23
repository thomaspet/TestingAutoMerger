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
import {APP_ROUTES} from './routes';
import {App} from './app';

import * as moment from 'moment';
import 'moment/locale/nb';

import {TabService} from './components/layout/navbar/tabstrip/tabService';
import {ToastService} from '../framework/uniToast/toastService';

import {UniFrameworkModule} from '../framework/frameworkModule';
import {AuthService} from '../framework/core';
import {AuthGuard} from './authGuard';
import {UniMicroAngularInternalErrorHandlerOverride} from './UniErrorHandler';
import {UniQueryModule} from './components/uniquery/uniqueryModule';
import {LayoutModule} from './components/layout/layoutModule';
import {AppCommonModule} from './components/common/appCommonModule';
import {DashboardModule} from './components/dashboard/dashboardModule';
import {BureauModule} from './components/bureau/bureauModule';
import {ReportsModule} from './components/reports/reportsModule';
import {InitModule} from './components/init/initModule';
import {AdminModule} from './components/admin/adminModule';
import {CurrencyModule} from './components/currency/currencyModule';
import {DimensionsModule} from './components/dimensions/dimensionsModule';
import {UniTickerModule} from './components/uniticker/uniTickerModule';
import {TranslationsModule} from './components/translations/module';
import {WidgetModule} from './components/widgets/widgetModule';

import {AssignmentsModule} from './components/assignments/assignmentsModule';

// TODO: REVISIT SERVICES (we probably dont need all to be singletons)
import {AccountingServicesModule} from './services/accountingServicesModule';
import {CommonServicesModule} from './services/commonServicesModule';
import {ReportServicesModule} from './services/reportServicesModule';
import {SalaryServicesModule} from './services/salaryServicesModule';
import {TimeTrackingServicesModule} from './services/timetrackingServicesModule';
import {SalesServicesModule} from './services/salesServicesModule';
import {AdminServicesModule} from './services/adminServicesModule';
import {AssignmentServicesModule} from './services/assignmentServicesModule';

import {CanDeactivateGuard} from './canDeactivateGuard';
import {RoutePermissionGuard} from './routePermissionGuard';
import {AboutModule} from './components/about/aboutModule';

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

        CommonServicesModule.forRoot(),
        ReportServicesModule.forRoot(),
        AccountingServicesModule.forRoot(),
        SalaryServicesModule.forRoot(),
        SalesServicesModule.forRoot(),
        TimeTrackingServicesModule.forRoot(),
        AdminServicesModule.forRoot(),
        AssignmentServicesModule.forRoot(),

        APP_ROUTES,
        UniFrameworkModule,

        // COMMON MODULES
        LayoutModule,
        AppCommonModule,
        WidgetModule,
        UniQueryModule,
        ReportsModule,
        InitModule,
        AdminModule,
        CurrencyModule,
        DimensionsModule,
        UniTickerModule,
        TranslationsModule,
        DashboardModule,
        BureauModule,
        AboutModule,
        AssignmentsModule
    ],
    declarations: [
        App
    ],
    bootstrap: [App],
    providers: [
        AuthService,
        AuthGuard,
        RoutePermissionGuard,
        CanDeactivateGuard,
        TabService,
        ToastService,
        COMPILER_PROVIDERS,
        {provide: LocationStrategy, useClass: HashLocationStrategy},
        {provide: ErrorHandler, useClass: UniMicroAngularInternalErrorHandlerOverride}
    ],
})
export class AppModule {}
