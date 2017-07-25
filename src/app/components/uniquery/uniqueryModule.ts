// Angular imports
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';

// App imports
import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';

// routes
import {routes as UniQueryRoutes} from './uniQueriesRoutes';
import {UniQueryOverview} from './overview/overview';
import {UniQueryDetails} from './details/uniQueryDetails';
import {SaveQueryDefinitionForm, SaveQueryDefinitionModal} from './details/saveQueryDefinitionModal';
import {UniQueries} from './uniQueries';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,

        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,

        UniQueryRoutes
    ],
    declarations: [
        UniQueries,
        UniQueryOverview,
        UniQueryDetails,
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
        SaveQueryDefinitionForm,
        SaveQueryDefinitionModal
    ]
})
export class UniQueryModule {}
