import {Routes} from '@angular/router';
import {Marketplace} from './marketplace';
import {MarketplaceIntegrations} from './integrations/marketplaceIntegrations';
import {MarketplaceModules} from '@app/components/marketplace/modules/marketplaceModules';
import {ProductPurchases} from './product-purchases/productPurchases';

export const marketplaceRoutes: Routes = [
    {
        path: 'marketplace',
        component: Marketplace,
        children: [
            {
                path: '',
                redirectTo: 'modules',
                pathMatch: 'full',
            },
            {
                path: 'modules',
                component: MarketplaceModules,
            },
            {
                path: 'integrations',
                component: MarketplaceIntegrations,
            },
            {
                path: 'purchases',
                component: ProductPurchases,
            },
        ]
    }
];
