import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {Sharings} from './sharings';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {RouterModule} from '@angular/router';
import {LayoutModule} from '../layout/layoutModule';
import {UniTickerModule} from '../uniticker/uniTickerModule';
import {SharingsList} from './list/sharingsList';
import {AppCommonModule} from '../common/appCommonModule';
import {routes as SharingsRoutes} from './sharingsRoutes';

@NgModule({
    imports: [
        CommonModule,
        UniFrameworkModule,
        ReactiveFormsModule,
        AppPipesModule,
        RouterModule,
        LayoutModule,
        UniTickerModule,
        SharingsRoutes,
        AppCommonModule
    ],
    declarations: [
        Sharings,
        SharingsList
    ],
    providers: [
    ],
    entryComponents: [
    ]
})
export class SharingsModule {}
