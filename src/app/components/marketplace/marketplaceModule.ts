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

@NgModule({
    imports: [
        LibraryImportsModule,
        UniFrameworkModule,
        RouterModule,
        LayoutModule,
    ],
    declarations: [
        Marketplace,
        MarketplaceModules,
        MarketplaceIntegrations,
        SubscribeModal,
        FilterIntegrationsPipe,
        ProductPurchases,
    ]
})
export class MarketplaceModule {}
