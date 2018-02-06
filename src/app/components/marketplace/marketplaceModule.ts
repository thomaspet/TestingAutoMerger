import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {Marketplace} from './marketplace';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {RouterModule} from '@angular/router';
import {LayoutModule} from '../layout/layoutModule';
import {MarketplaceAddOns} from './addons/marketplaceAddOns';
import {MarketplaceIntegrations} from './integrations/marketplaceIntegrations';
import {MarketplaceWebinars} from './webinars/marketplaceWebinars';
import {MarketplaceAddOnsDetails} from './addons/marketplaceAddOnsDetail';
import {FilterOutBundlesPipe} from './addons/filterOutBundlesPipe';
import {OnlyBundlesPipe} from './addons/onlyBundlesPipe';

@NgModule({
    imports: [
        CommonModule,
        UniFrameworkModule,
        ReactiveFormsModule,
        AppPipesModule,
        RouterModule,
        LayoutModule,
    ],
    declarations: [
        Marketplace,
        MarketplaceAddOns,
        MarketplaceAddOnsDetails,
        MarketplaceWebinars,
        MarketplaceIntegrations,
        FilterOutBundlesPipe,
        OnlyBundlesPipe
    ],
})
export class MarketplaceModule {}
