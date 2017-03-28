import { NgModule, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dashboard } from './dashboard';
import { UniFrameworkModule } from '../../../framework/frameworkModule';
import { WidgetModule } from '../widgets/widgetModule'

@NgModule({

    imports: [
        CommonModule,
        UniFrameworkModule,
        WidgetModule
    ],
    declarations: [
        Dashboard
    ],
    exports: [
        CommonModule
    ]

})

export class DashboardModule { }