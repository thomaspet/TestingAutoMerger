import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {UniWidgetDemo} from './demo/widgetDemo';
import {UniWidgetCanvas} from './widgetCanvas';
import {UniWidget, WidgetContainer} from './uniWidget';

import {
    UniShortcutWidget,
    UniNotificationWidget,
    UniChartWidget,
    UniRSSWidget
} from './widgets/barrel';


@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        UniWidgetDemo,
        UniWidgetCanvas,
        UniWidget,
        WidgetContainer,
        UniShortcutWidget,
        UniNotificationWidget,
        UniChartWidget,
        UniRSSWidget
    ],
    entryComponents: [
        UniShortcutWidget,
        UniNotificationWidget,
        UniChartWidget,
        UniRSSWidget
    ]
})
export class WidgetModule {}
