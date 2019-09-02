import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AppCommonModule} from '../common/appCommonModule';
import {UniVersionsView} from './versions/versionsView';
import {UniFrameworkModule} from '@uni-framework/frameworkModule';

@NgModule({
    imports: [
        CommonModule,
        AppCommonModule,
        UniFrameworkModule // remove me! just used for testing
    ],
    declarations: [
        UniVersionsView
    ],
    exports: [
        UniVersionsView
    ]
})
export class AboutModule {}
