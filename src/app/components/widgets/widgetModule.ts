import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {UniWidgetCanvas} from './widgetCanvas';
import {UniWidget, WidgetContainer} from './uniWidget';
import {WidgetDataService} from './widgetDataService';
import {UNI_WIDGETS} from './widgets/barrel';

@NgModule({
    imports: [
        CommonModule,
        UniFrameworkModule
    ],
    declarations: [
        UniWidgetCanvas,
        UniWidget,
        WidgetContainer,
        ...UNI_WIDGETS
    ],
    entryComponents: [
        ...UNI_WIDGETS,
        UniWidgetCanvas
    ],
    providers: [
        WidgetDataService
    ],
    exports: [
        UniWidgetCanvas
    ]
})
export class WidgetModule {}
