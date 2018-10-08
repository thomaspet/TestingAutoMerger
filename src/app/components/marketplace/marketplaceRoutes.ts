import {Routes} from '@angular/router';
import {Marketplace} from './marketplace';
import {MarketplaceIntegrations} from './integrations/marketplaceIntegrations';
import {MarketplaceWebinars} from './webinars/marketplaceWebinars';
import {MarketplaceModules} from '@app/components/marketplace/modules/marketplaceModules';

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
                path: 'webinars',
                component: MarketplaceWebinars,
            },
            {
                path: 'integrations',
                component: MarketplaceIntegrations,
            },
        ]
    }
];
