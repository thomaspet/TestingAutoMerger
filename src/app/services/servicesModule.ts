import {NgModule} from '@angular/core';

import {AccountingServicesModule} from './accountingServicesModule';
import {CommonServicesModule} from './commonServicesModule';
import {ReportServicesModule} from './reportServicesModule';
import {SalaryServicesModule} from './salaryServicesModule';
import {SalesServicesModule} from './salesServicesModule';
import {TimeTrackingServicesModule} from './timetrackingServicesModule';
import {AdminServicesModule} from './adminServicesModule';

@NgModule({
    imports: [
        AccountingServicesModule,
        CommonServicesModule,
        ReportServicesModule,
        SalaryServicesModule,
        SalesServicesModule,
        TimeTrackingServicesModule,
        AdminServicesModule
    ],
    exports: [
        AccountingServicesModule,
        CommonServicesModule,
        ReportServicesModule,
        SalaryServicesModule,
        SalesServicesModule,
        TimeTrackingServicesModule,
        AdminServicesModule
    ]
})
export class AppServicesModule {

}
