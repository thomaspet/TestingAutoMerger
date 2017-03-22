import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {UniWidgetCanvas} from './widgetCanvas';
import { UniWidget, WidgetContainer } from './uniWidget';
import { Widget1, Widget2, Widget3, UniShortcutWidget, UniNotificationWidget } from './widgets/barrel';


@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        UniWidgetCanvas,
        UniWidget,
        WidgetContainer,
        Widget1,
        Widget2,
        Widget3,
        UniShortcutWidget,
        UniNotificationWidget
    ],
    entryComponents: [
        Widget1,
        Widget2,
        Widget3,
        UniShortcutWidget,
        UniNotificationWidget
    ],
    exports: []
})
export class WidgetModule {}
