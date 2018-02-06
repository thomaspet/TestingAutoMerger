import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AppCommonModule} from '../common/appCommonModule';
import {UniVersionsView} from './versions/versionsView';

@NgModule({
    imports: [
        CommonModule,
        AppCommonModule
    ],
    declarations: [
        UniVersionsView
    ],
    exports: [
        UniVersionsView
    ]
})
export class AboutModule {}
