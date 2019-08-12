/// <reference path='../../node_modules/immutable/dist/immutable.d.ts' />
import {NgModule, ErrorHandler} from '@angular/core';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';
import {APP_ROUTES} from './routes';
import {App} from './app';

import * as moment from 'moment';
import 'moment/locale/nb';

import {TabService} from './components/layout/navbar/tabstrip/tabService';
import {ToastService} from '../framework/uniToast/toastService';

import {UniFrameworkModule} from '../framework/frameworkModule';
import {AuthService} from './authService';
import {AuthGuard} from './authGuard';
import {UniAngularErrorHandler} from './angularErrorHandler';
import {CompanyKeyRouteGuard} from './companyKeyRouteGuard';
import {UniQueryModule} from './components/uniquery/uniqueryModule';
import {LayoutModule} from './components/layout/layoutModule';
import {AppCommonModule} from './components/common/appCommonModule';
import {DashboardModule} from './components/dashboard/dashboardModule';
import {BureauModule} from './components/bureau/bureauModule';
import {ReportsModule} from './components/reports/reportsModule';
import {InitModule} from './components/init/init.module';
import {AdminModule} from './components/admin/adminModule';
import {CurrencyModule} from './components/currency/currencyModule';
import {DimensionsModule} from './components/dimensions/dimensionsModule';
import {UniTickerModule} from './components/uniticker/uniTickerModule';
// import {TranslationsModule} from './components/translations/module';
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
import {MarketplaceModule} from './components/marketplace/marketplaceModule';
import {SharingsModule} from './components/sharings/sharingsModule';
import {ElsaServicesModule} from '@app/services/elsaServicesModule';

import {ReloadHelper} from './reload';

// Set moment locale
// TODO: Allow users to change this during runtime
moment.locale('nb');

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterModule,

        UniFrameworkModule,

        CommonServicesModule.forRoot(),
        ReportServicesModule.forRoot(),
        AccountingServicesModule.forRoot(),
        SalaryServicesModule.forRoot(),
        SalesServicesModule.forRoot(),
        TimeTrackingServicesModule.forRoot(),
        AdminServicesModule.forRoot(),
        AssignmentServicesModule.forRoot(),
        ElsaServicesModule.forRoot(),

        APP_ROUTES,


        // COMMON MODULES
        LayoutModule.forRoot(),
        AppCommonModule,
        WidgetModule,
        UniQueryModule,
        ReportsModule,
        InitModule,
        AdminModule,
        CurrencyModule,
        DimensionsModule,
        UniTickerModule,
        // TranslationsModule,
        DashboardModule,
        BureauModule,
        MarketplaceModule,
        SharingsModule,
        AboutModule,
        AssignmentsModule
    ],
    declarations: [
        App,
        ReloadHelper
    ],
    bootstrap: [App],
    providers: [
        AuthService,
        AuthGuard,
        CompanyKeyRouteGuard,
        RoutePermissionGuard,
        CanDeactivateGuard,
        TabService,
        ToastService,
        {provide: LocationStrategy, useClass: HashLocationStrategy},
        {provide: ErrorHandler, useClass: UniAngularErrorHandler}
    ],
})
export class AppModule {}
