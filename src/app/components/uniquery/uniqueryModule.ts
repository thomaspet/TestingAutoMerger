import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';

import {UniQueryOverview} from './overview/overview';
import {UniQueryDetails} from './details/uniQueryDetails';
import {SaveQueryDefinitionForm, SaveQueryDefinitionModal} from './details/saveQueryDefinitionModal';
import {UniQueries} from './uniQueries';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,

        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
    ],
    declarations: [
        UniQueries,
        UniQueryOverview,
        UniQueryDetails,
        SaveQueryDefinitionForm,
        SaveQueryDefinitionModal
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
