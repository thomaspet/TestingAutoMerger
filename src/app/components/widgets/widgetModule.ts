import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {UniWidgetDemo} from './demo/widgetDemo';
import {UniWidgetCanvas} from './widgetCanvas';
import { UniWidget, WidgetContainer } from './uniWidget';
import { Widget1, Widget2, Widget3, UniShortcutWidget, UniNotificationWidget, UniChartWidget } from './widgets/barrel';


@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        UniWidgetDemo,
        UniWidgetCanvas,
        UniWidget,
        WidgetContainer,
        Widget1,
        Widget2,
        Widget3,
        UniShortcutWidget,
        UniNotificationWidget,
        UniChartWidget
    ],
    entryComponents: [
        Widget1,
        Widget2,
        Widget3,
        UniShortcutWidget,
        UniNotificationWidget,
        UniChartWidget
    ],
    exports: []
})
export class WidgetModule {}
