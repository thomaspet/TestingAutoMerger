import {NgModule} from '@angular/core';
import {LibraryImportsModule} from '@app/library-imports.module';
import {UniFrameworkModule} from '@uni-framework/frameworkModule';
import {LayoutModule} from '@app/components/layout/layoutModule';
import {AppCommonModule} from '@app/components/common/appCommonModule';
import {RouterModule} from '@angular/router';
import {OpeningBalanceComponent} from '@app/components/settings/opening-balance/openingBalance';
import {OpeningBalanceService} from '@app/components/settings/opening-balance/openingBalanceService';
import {CreateOpeningBalanceModal} from '@app/components/settings/opening-balance/createOpeningBalanceModal';
import {EditDraftLineModal} from '@app/components/settings/opening-balance/editDraftLineModal';
import {GoToPostModal} from '@app/components/settings/opening-balance/goToPostModal';

@NgModule({
    imports: [
        LibraryImportsModule,
        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
        RouterModule.forChild([{
            path: '',
            pathMatch: 'full',
            component: OpeningBalanceComponent
        }])
    ],
    declarations: [
        OpeningBalanceComponent,
        CreateOpeningBalanceModal,
        EditDraftLineModal,
        GoToPostModal
    ],
    providers: [
        OpeningBalanceService
    ]
})
export class OpeningBalanceModule {}
