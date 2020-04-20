import {NgModule} from '@angular/core';
import {LibraryImportsModule} from '@app/library-imports.module';
import {AppCommonModule} from '@app/components/common/appCommonModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {UniWidgetCanvas} from './widgetCanvas';
import {UniWidget, WidgetContainer} from './uniWidget';
import {WidgetDataService} from './widgetDataService';
import {UNI_WIDGETS} from './widgets/barrel';
import {CanvasHelper} from '@app/components/widgets/canvasHelper';

import {SelectReportsModal} from './widgets/report-list/select-reports-modal';
import {ReportsModule} from '../reports/reportsModule';
import {NewsfeedWidget} from './newsfeed/newsfeed';
import {PublicDuedatesModal} from './widgets/public-duedates-widget/public-duedate-modal';
import {CustomPaymentModal} from './widgets/liquidity-widget/custom-payment-modal';

@NgModule({
    imports: [
        LibraryImportsModule,
        UniFrameworkModule,
        AppCommonModule,
        ReportsModule,
    ],
    declarations: [
        UniWidgetCanvas,
        UniWidget,
        WidgetContainer,
        SelectReportsModal,
        NewsfeedWidget,
        PublicDuedatesModal,
        CustomPaymentModal,
        ...UNI_WIDGETS
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
