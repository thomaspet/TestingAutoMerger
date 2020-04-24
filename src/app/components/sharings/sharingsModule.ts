import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {RouterModule} from '@angular/router';
import {LayoutModule} from '../layout/layoutModule';
import {UniTickerModule} from '../uniticker/uniTickerModule';
import {SharingsList} from './list/sharingsList';
import {AppCommonModule} from '../common/appCommonModule';

@NgModule({
    imports: [
        CommonModule,
        UniFrameworkModule,
        ReactiveFormsModule,
        RouterModule,
        LayoutModule,
        UniTickerModule,
        AppCommonModule
    ],
    declarations: [
        SharingsList
    ]
})
export class SharingsModule {}
