import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {Marketplace} from './marketplace';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {RouterModule} from '@angular/router';
import {LayoutModule} from '../layout/layoutModule';
import {MarketplaceIntegrations} from './integrations/marketplaceIntegrations';
import {SubscribeModal} from '@app/components/marketplace/subscribe-modal/subscribe-modal';
import {MarketplaceModules} from '@app/components/marketplace/modules/marketplaceModules';
import {MatTooltipModule} from '@angular/material';

@NgModule({
    imports: [
        CommonModule,
        UniFrameworkModule,
        ReactiveFormsModule,
        AppPipesModule,
        RouterModule,
        LayoutModule,
        MatTooltipModule,
    ],
    declarations: [
        Marketplace,
        MarketplaceModules,
        MarketplaceIntegrations,
        SubscribeModal,
    ],
    entryComponents: [
        SubscribeModal,
    ],
})
export class MarketplaceModule {}
