import {Routes} from '@angular/router';
import {MarketplaceAddOns} from './addons/marketplaceAddOns';
import {Marketplace} from './marketplace';
import {MarketplaceIntegrations} from './integrations/marketplaceIntegrations';
import {MarketplaceWebinars} from './webinars/marketplaceWebinars';
import {MarketplaceAddOnsDetails} from './addons/marketplaceAddOnsDetail';

export const marketplaceRoutes: Routes = [
    {
        path: 'marketplace',
        component: Marketplace,
        children: [
            {
                path: '',
                redirectTo: 'add-ons',
                pathMatch: 'full'
            },
            {
                path: 'add-ons',
                component: MarketplaceAddOns
            },
            {
                path: 'add-ons/:id',
                component: MarketplaceAddOnsDetails
            },
            {
                path: 'webinars',
                component: MarketplaceWebinars
            },
            {
                path: 'integrations',
                component: MarketplaceIntegrations
            }
        ]
    }
];
