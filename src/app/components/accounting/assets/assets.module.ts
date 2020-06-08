import {NgModule} from '@angular/core';
import {DateAdapter} from '@angular/material/core';
import {UniDateAdapter} from '@app/date-adapter';
import {AssetsService} from '@app/services/common/assetsService';
import {AssetsStore} from '@app/components/accounting/assets/assets.store';
import {AssetsActions} from '@app/components/accounting/assets/assets.actions';
import {AssetDetailFormConfigBuilder} from '@app/components/accounting/assets/asset-detail/asset-detail-form-config-builder';
import {AssetsListComponent} from '@app/components/accounting/assets/assets-list/assets-list';
import {AssetsDetailComponent} from '@app/components/accounting/assets/asset-detail/asset-detail';
import {AssetFormComponent} from '@app/components/accounting/assets/asset-detail/forms/asset-form/asset-form';
import {DepreciationFormComponent} from '@app/components/accounting/assets/asset-detail/forms/depreciation-form/depreciation-form';
import {AccountingDepreciationFormComponent} from '@app/components/accounting/assets/asset-detail/forms/accounting-Depreciation-form/accounting-depreciation-form';
import {TaxDepreciationFormComponent} from '@app/components/accounting/assets/asset-detail/forms/tax-depreciation-form/tax-depreciation-form';
import {AssetsHistoryComponent} from '@app/components/accounting/assets/assets-history/assets-history';
import {RegisterAssetAsSoldModal} from '@app/components/accounting/assets/register-asset-as-sold-modal/register-asset-as-sold-modal';
import {RegisterDepreciationModal} from '@app/components/accounting/assets/register-depreciation-modal/register-depreciation-modal';
import {RegisterAssetAsLostModal} from '@app/components/accounting/assets/register-asset-as-lost-modal/register-asset-as-lost-modal';
import {DeleteAssetModal} from '@app/components/accounting/assets/delete-asset-modal/delete-asset-modal';
import {AssetDetailsTab} from '@app/components/accounting/assets/asset-details-tab';
import {AssetsListTab} from '@app/components/accounting/assets/assets-list/assets-list-tab';
import {AssetDetailsToolbar} from '@app/components/accounting/assets/asset-details-toolbar';
import {AssetsListToolbar} from '@app/components/accounting/assets/assets-list/assets-list-toolbar';
import {RouterModule} from '@angular/router';
import {assetsRoutes} from '@app/components/accounting/assets/assets.routes';
import {LibraryImportsModule} from '@app/library-imports.module';
import {UniFrameworkModule} from '@uni-framework/frameworkModule';
import {LayoutModule} from '@app/components/layout/layoutModule';
import {AppCommonModule} from '@app/components/common/appCommonModule';
import {AssetDocumentsComponent} from '@app/components/accounting/assets/asset-documents/asset-documents';

@NgModule({
    imports: [
        LibraryImportsModule,
        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
        RouterModule.forChild(assetsRoutes)
    ],
    declarations: [
        // Assets
        AssetsListComponent,
        AssetsDetailComponent,
        AssetDocumentsComponent,
        AssetFormComponent,
        DepreciationFormComponent,
        AccountingDepreciationFormComponent,
        TaxDepreciationFormComponent,
        AssetsHistoryComponent,
        RegisterAssetAsSoldModal,
        RegisterDepreciationModal,
        RegisterAssetAsLostModal,
        DeleteAssetModal,
        AssetDetailsTab,
        AssetsListTab,
        AssetDetailsToolbar,
        AssetsListToolbar,
    ],
    providers: [
        { provide: DateAdapter, useClass: UniDateAdapter },
        { provide: AssetsService, useClass: AssetsService },
        AssetsStore,
        AssetsActions,
        AssetDetailFormConfigBuilder,
    ]
})
export class AssetsModule {
}
