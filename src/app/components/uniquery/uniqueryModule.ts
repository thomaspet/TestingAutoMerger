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
import {AppServicesModule} from '../../services/servicesModule';

// routes
import {routes as UniQueryRoutes} from './uniQueriesRoutes';
import {UniQueryOverview} from './overview/overview';
import {UniQueryDetails} from './details/uniQueryDetails';
import {RelationNode} from './details/relationNode';
import {SaveQueryDefinitionForm, SaveQueryDefinitionModal} from './details/saveQueryDefinitionModal';
import {UniQueries} from './uniQueries';

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

        // UniForm
        UniFormModule,

        // Framework
        UniFrameworkModule,

        // App Modules
        LayoutModule,
        AppCommonModule,
        AppPipesModule,
        AppServicesModule,

        // Route module
        UniQueryRoutes
    ],
    declarations: [
        UniQueries,
        UniQueryOverview,
        UniQueryDetails,
        RelationNode,
        SaveQueryDefinitionForm,
        SaveQueryDefinitionModal
    ],
    entryComponents: [
        SaveQueryDefinitionForm
    ],
    exports: [
        UniQueries,
        UniQueryOverview,
        UniQueryDetails,
        RelationNode,
        SaveQueryDefinitionForm,
        SaveQueryDefinitionModal
    ]
})
export class UniQueryModule {}
