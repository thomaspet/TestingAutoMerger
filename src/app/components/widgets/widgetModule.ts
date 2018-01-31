import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {UniWidgetCanvas} from './widgetCanvas';
import {UniWidget, WidgetContainer} from './uniWidget';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {WidgetDataService} from './widgetDataService';
import {UNI_WIDGETS} from './widgets/barrel';
import {CanvasHelper} from '@app/components/widgets/canvasHelper';

@NgModule({
    imports: [
        CommonModule,
        UniFrameworkModule,
        AppPipesModule
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
        WidgetDataService,
        CanvasHelper,
    ],
    exports: [
        UniWidgetCanvas
    ]
})
export class WidgetModule {}
