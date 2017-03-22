import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {UniWidgetCanvas} from './widgetCanvas';
import {UniWidget, WidgetContainer} from './uniWidget';
import {Widget1, Widget2, Widget3} from './dashboard/dashboardWidgets';


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
        Widget3
    ],
    entryComponents: [
        Widget1,
        Widget2,
        Widget3
    ],
    exports: []
})
export class WidgetModule {}
