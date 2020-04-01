import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LibraryImportsModule} from '@app/library-imports.module';

import {UniFrameworkModule} from '@uni-framework/frameworkModule';
import {AppCommonModule} from '@app/components/common/appCommonModule';
import {LayoutModule} from '@app/components/layout/layoutModule';
import {ImportCentral} from './import-central';
import {ImportCentralPage} from './import-central-page/import-central-page';
import {ImportCentralLog} from './import-central-history/import-central-log';
import {DownloadTemplateModal} from './modals/download-template/download-template-modal';
import {ImportDetailsModal} from './modals/import-details/import-details-modal';

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
        LibraryImportsModule,
        RouterModule.forChild(routes),
        AppCommonModule,
        LayoutModule,
        UniFrameworkModule,
    ],
    declarations: [
        ImportCentral,
        ImportCentralPage,
        ImportCentralLog,
        DownloadTemplateModal,
        ImportDetailsModal
    ]
})
export class ImportCentralModule { }
