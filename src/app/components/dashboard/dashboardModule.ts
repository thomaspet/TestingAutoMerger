import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Dashboard} from './dashboard';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {WidgetModule} from '../widgets/widgetModule';
import {AppCommonModule} from '../common/appCommonModule';

@NgModule({
    imports: [
        CommonModule,
        UniFrameworkModule,
        WidgetModule,
        AppCommonModule
    ],
    declarations: [Dashboard]
})
export class DashboardModule { }
