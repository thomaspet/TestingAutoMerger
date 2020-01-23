import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';
import {altinnRoutes} from './altinnRoutes';
import {ReportsModule} from '../reports/reportsModule';
import {AppPipesModule} from '@app/pipes/appPipesModule';

import {AltinnOverviewComponent} from './overview/altinn-overview.component';
import {AltinnOverviewDetailsComponent} from './overview/altinn-overview-details/altinn-overview-details.component';
import {BarnepassView} from './overview/barnepass/barnepassview';
import {AltinnOverviewParser} from './overview/altinnOverviewParser';
import {AltinnSettings} from './settings/altinnSettings';

import {
    MatSlideToggleModule,
    MatTooltipModule,
    MatTreeModule,
 } from '@angular/material';
import { SelfEmployedView } from './overview/selfemployed/selfemployedview';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatSlideToggleModule,
        MatTreeModule,
        MatTooltipModule,

        RouterModule.forChild(altinnRoutes),

        UniFrameworkModule,
        AppPipesModule,
        LayoutModule,
        AppCommonModule,
        ReportsModule,
    ],
    declarations: [
        AltinnOverviewComponent,
        AltinnOverviewDetailsComponent,
        AltinnSettings,
        BarnepassView,
        SelfEmployedView
    ],
    entryComponents: [

    ],
    providers: [
        AltinnOverviewParser
    ],
    exports: [

    ]
})
export class AltinnModule {
}
