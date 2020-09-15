import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {LibraryImportsModule} from '@app/library-imports.module';

import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';
import {altinnRoutes} from './altinnRoutes';
import {ReportsModule} from '../reports/reportsModule';

import {AltinnOverviewComponent} from './overview/altinn-overview.component';
import {AltinnOverviewDetailsComponent} from './overview/altinn-overview-details/altinn-overview-details.component';
import {BarnepassView} from './overview/barnepass/barnepassview';
import {AltinnOverviewParser} from './overview/altinnOverviewParser';
import {AltinnSettings} from './settings/altinnSettings';

import {SelfEmployedView} from './overview/selfemployed/selfemployedview';
import {SelfEmployedDetailsModal} from '@app/components/altinn/overview/selfemployed/selfemployed-details-modal/selfemployed-details-modal';
import { TaxReportModal } from './taxreport/taxreportModal';

@NgModule({
    imports: [
        LibraryImportsModule,

        RouterModule.forChild(altinnRoutes),

        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
        ReportsModule,
    ],
    declarations: [
        AltinnOverviewComponent,
        AltinnOverviewDetailsComponent,
        AltinnSettings,
        BarnepassView,
        SelfEmployedView,
        SelfEmployedDetailsModal,
        TaxReportModal
    ],
    providers: [
        AltinnOverviewParser
    ]
})
export class AltinnModule {
}
