// Angular imports
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

// app


import {UniAbout} from './about';
import {UniVersionsView} from './versions/versionsView';
import {routes as AboutRoutes} from './aboutRoutes';
import {AppCommonModule} from '../common/appCommonModule';

@NgModule({
    imports: [
        CommonModule,
        AboutRoutes,
        AppCommonModule
    ],
    declarations: [
        UniAbout,
        UniVersionsView
    ],
    exports: [
        UniAbout,
        UniVersionsView
    ]
})
export class AboutModule {}
