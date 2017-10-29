import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MarketplaceAddOns} from './addons/marketplaceAddOns';
import {Marketplace} from './marketplace';
import {MarketplaceIntegrations} from './integrations/marketplaceIntegrations';
import {MarketplaceWebinars} from './webinars/marketplaceWebinars';
import {MarketplaceAddOnsDetails} from './addons/marketplaceAddOnsDetail';

const childRoutes: Routes = [
    {
        path: '',
        redirectTo: 'add-ons',
        pathMatch: 'full'
    },
    {
        path: 'add-ons',
        children: [
            {
                path: '',
                component: MarketplaceAddOns
            },
            {
                path: ':id',
                component: MarketplaceAddOnsDetails
            }
        ]
    },
    {
        path: 'webinars',
        component: MarketplaceWebinars
    },
    {
        path: 'integrations',
        component: MarketplaceIntegrations
    }
];

const marketplaceRoutes: Routes = [
    {
        path: 'marketplace',
        component: Marketplace,
        children: childRoutes
    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(marketplaceRoutes);
