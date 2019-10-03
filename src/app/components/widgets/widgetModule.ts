import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {AppCommonModule} from '@app/components/common/appCommonModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {UniWidgetCanvas} from './widgetCanvas';
import {UniWidget, WidgetContainer} from './uniWidget';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {WidgetDataService} from './widgetDataService';
import {UNI_WIDGETS} from './widgets/barrel';
import {CanvasHelper} from '@app/components/widgets/canvasHelper';

import {SelectReportsModal} from './widgets/report-list/select-reports-modal';
import {MatExpansionModule, MatMenuModule} from '@angular/material';
import {ReportsModule} from '../reports/reportsModule';
import {NewsfeedWidget} from './newsfeed/newsfeed';
import {PublicDuedatesModal} from './widgets/public-duedates-widget/public-duedate-modal';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        MatExpansionModule,
        MatMenuModule,
        UniFrameworkModule,
        AppCommonModule,
        AppPipesModule,
        ReportsModule,
    ],
    declarations: [
        UniWidgetCanvas,
        UniWidget,
        WidgetContainer,
        SelectReportsModal,
        NewsfeedWidget,
        PublicDuedatesModal,
        ...UNI_WIDGETS
    ],
    entryComponents: [
        ...UNI_WIDGETS,
        UniWidgetCanvas,
        SelectReportsModal,
        PublicDuedatesModal
    ],
    providers: [
        WidgetDataService,
        CanvasHelper,
    ],
    exports: [
        UniWidgetCanvas
    ]
})
export class WidgetModule {}
