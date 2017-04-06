import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UniFrameworkModule } from '../../../framework/frameworkModule';
import {UniWidgetDemo} from './demo/widgetDemo';
import {UniWidgetCanvas} from './widgetCanvas';
import { UniWidget, WidgetContainer } from './uniWidget';
import { WidgetDataService } from './widgetDataService';
import {UNI_WIDGETS} from './widgets/barrel';


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
        ...UNI_WIDGETS
    ],
    entryComponents: [
        ...UNI_WIDGETS
    ],
    providers: [
        WidgetDataService
    ],
    exports: [
        UniWidgetCanvas
    ]
})
export class WidgetModule {}
