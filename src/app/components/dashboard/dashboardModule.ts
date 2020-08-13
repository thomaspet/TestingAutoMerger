import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Dashboard} from './dashboard';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';

@NgModule({
    imports: [
        CommonModule,
        UniFrameworkModule,
        AppCommonModule
    ],
    declarations: [Dashboard]
})
export class DashboardModule { }
