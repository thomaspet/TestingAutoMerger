// Angular imports
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';

// App imports
import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {UniTableModule} from 'unitable-ng2/main';
import {UniFormModule} from 'uniform-ng2/main';
import {AppCommonModule} from '../common/appCommonModule';
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
        CommonModule,
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
        // AppServicesModule,

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
