import {NgModule} from '@angular/core';
import {UniCacheService} from './cacheService';
import {ParamsService} from './ParamsService';
import {RootRouteParamsService} from './rootRouteParams';
import {StaticRegisterService} from './StaticRegisterService';
import {AccountingServicesModule} from './Accounting/AccountingServicesModule';
import {CommonServicesModule} from './common/CommonServicesModule';
import {ReportServicesModule} from './reports/ReportServicesModule';
import {SalaryServicesModule} from './Salary/SalaryServicesModule';
import {SalesServicesModule} from './Sales/SalesServicesModule';
import {SharedServicesModule} from './Shared/SharedServicesModule';
import {TimeTrackingModule} from './Timetracking/TimeTrackingModule';
import {BrowserStorageService} from './BrowserStorageService';

@NgModule({
    imports: [
        AccountingServicesModule,
        CommonServicesModule,
        ReportServicesModule,
        SalaryServicesModule,
        SalesServicesModule,
        SharedServicesModule,
        TimeTrackingModule
    ],
    providers: [
        UniCacheService,
        ParamsService,
        RootRouteParamsService,
        StaticRegisterService,
        BrowserStorageService
    ],
    exports: [
        AccountingServicesModule,
        CommonServicesModule,
        ReportServicesModule,
        SalaryServicesModule,
        SalesServicesModule,
        SharedServicesModule,
        TimeTrackingModule
    ]
})
export class AppServicesModule {

}
