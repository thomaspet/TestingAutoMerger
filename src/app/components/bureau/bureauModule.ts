import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {WidgetModule} from '../widgets/widgetModule';

import {BureauDashboard} from './bureauDashboard';

@NgModule({
    imports: [
        CommonModule,
        UniFrameworkModule,
        WidgetModule
    ],
    declarations: [
        BureauDashboard
    ],
    exports: [
        CommonModule
    ]
})
export class BureauModule {}
