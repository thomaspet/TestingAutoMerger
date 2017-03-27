// Angular imports
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';

// App imports
import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {UniTableModule} from 'unitable-ng2/main';
import {UniFormModule} from 'uniform-ng2/main';
import {AppCommonModule} from '../common/appCommonModule';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {UniQueryModule} from '../uniquery/uniqueryModule';

// routes
import {routes as AdminRoutes} from './adminRoutes';

// app
import {UniAdmin} from './admin';
import {Jobs} from './jobs/jobs';
import {UniModels} from './models/models';


@NgModule({
    imports: [
        // Angular modules
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,

        // UniTable
        UniTableModule,

        // UniFormModule,
        UniFormModule,

        // Framework
        UniFrameworkModule,

        // App Modules
        LayoutModule,
        AppCommonModule,
        AppPipesModule,
        UniQueryModule,
        AdminRoutes
    ],
    declarations: [
        UniAdmin,
        Jobs,
        UniModels,
    ],
    exports: [
        UniAdmin,
        Jobs,
        UniModels,
    ]
})
export class AdminModule {
}
