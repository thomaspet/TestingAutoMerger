import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UniFrameworkModule } from '@uni-framework/frameworkModule';
import { AppCommonModule } from '@app/components/common/appCommonModule';
import { AppPipesModule } from '@app/pipes/appPipesModule';
import { LayoutModule } from '@app/components/layout/layoutModule';
import { ImportCentral } from './import-central';
import { ImportCentralPage } from './import-central-page/import-central-page';
import { ImportCentralLog } from './import-central-history/import-central-log';
import { DownloadTemplateModal } from './modals/download-template/download-template-modal';
import { ImportDetailsModal } from './modals/import-details/import-details-modal';
import { MatProgressBarModule } from '@angular/material';


const routes: Routes = [{
    path: '',
    component: ImportCentral,
    children: [
        {
            path: '',
            pathMatch: 'full',
            redirectTo: 'page'
        },
        {
            path: 'page',
            component: ImportCentralPage
        },
        {
            path: 'log',
            component: ImportCentralLog
        }
    ]
}];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        AppCommonModule,
        LayoutModule,
        UniFrameworkModule,
        AppPipesModule,
        MatProgressBarModule
    ],
    declarations: [
        ImportCentral,
        ImportCentralPage,
        ImportCentralLog,
        DownloadTemplateModal,
        ImportDetailsModal
    ],
    entryComponents: [
        DownloadTemplateModal,
        ImportDetailsModal
    ]
})
export class ImportCentralModule { }
