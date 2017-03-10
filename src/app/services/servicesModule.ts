import {NgModule} from '@angular/core';

import {AccountingServicesModule} from './accountingServicesModule';
import {CommonServicesModule} from './commonServicesModule';
import {ReportServicesModule} from './reportServicesModule';
import {SalaryServicesModule} from './salaryServicesModule';
import {SalesServicesModule} from './salesServicesModule';
import {TimeTrackingServicesModule} from './timetrackingServicesModule';

@NgModule({
    imports: [
        AccountingServicesModule,
        CommonServicesModule,
        ReportServicesModule,
        SalaryServicesModule,
        SalesServicesModule,
        TimeTrackingServicesModule
    ],
    exports: [
        AccountingServicesModule,
        CommonServicesModule,
        ReportServicesModule,
        SalaryServicesModule,
        SalesServicesModule,
        TimeTrackingServicesModule
    ]
})
export class AppServicesModule {

}
