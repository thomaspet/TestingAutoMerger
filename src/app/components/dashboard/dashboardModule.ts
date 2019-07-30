import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Dashboard} from './dashboard';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {WidgetModule} from '../widgets/widgetModule';
import {AppPipesModule} from '@app/pipes/appPipesModule';

@NgModule({

    imports: [
        CommonModule,
        UniFrameworkModule,
        WidgetModule,
        AppPipesModule
    ],
    declarations: [
        Dashboard
    ],
    exports: [
        CommonModule
    ]

})

export class DashboardModule { }
