import {NgModule} from '@angular/core';
import {LibraryImportsModule} from '@app/library-imports.module';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {Marketplace} from './marketplace';
import {RouterModule} from '@angular/router';
import {LayoutModule} from '../layout/layoutModule';
import {MarketplaceIntegrations, FilterIntegrationsPipe} from './integrations/marketplaceIntegrations';
import {SubscribeModal} from '@app/components/marketplace/subscribe-modal/subscribe-modal';
import {MarketplaceModules} from '@app/components/marketplace/modules/marketplaceModules';
import {ProductPurchases} from './product-purchases/productPurchases';
import {AppCommonModule} from '../common/appCommonModule';
import {ChangeContractTypeModal} from './modules/change-contract-type-modal/change-contract-type-modal';

@NgModule({
    imports: [
        LibraryImportsModule,
        UniFrameworkModule,
        RouterModule,
        LayoutModule,
        AppCommonModule,
    ],
    declarations: [
        Marketplace,
        MarketplaceModules,
        MarketplaceIntegrations,
        SubscribeModal,
        FilterIntegrationsPipe,
        ProductPurchases,
        ChangeContractTypeModal,
    ]
})
export class MarketplaceModule {}
