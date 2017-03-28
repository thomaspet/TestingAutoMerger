import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UniFrameworkModule } from '../../../framework/frameworkModule';
import {UniWidgetDemo} from './demo/widgetDemo';
import {UniWidgetCanvas} from './widgetCanvas';
import { UniWidget, WidgetContainer } from './uniWidget';
import { WidgetDataService } from './widgetDataService';

import {
    UniShortcutWidget,
    UniNotificationWidget,
    UniChartWidget,
    UniRSSWidget,
    UniListWidget
} from './widgets/barrel';


@NgModule({
    imports: [
        CommonModule,
        UniFrameworkModule
    ],
    declarations: [
        UniWidgetDemo,
        UniWidgetCanvas,
        UniWidget,
        WidgetContainer,
        UniShortcutWidget,
        UniNotificationWidget,
        UniChartWidget,
        UniRSSWidget,
        UniListWidget
    ],
    entryComponents: [
        UniShortcutWidget,
        UniNotificationWidget,
        UniChartWidget,
        UniRSSWidget,
        UniListWidget
    ],
    providers: [
        WidgetDataService
    ],
    exports: [UniWidgetCanvas]
})
export class WidgetModule {}
