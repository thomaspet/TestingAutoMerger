import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {Marketplace} from './marketplace';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {RouterModule} from '@angular/router';
import {LayoutModule} from '../layout/layoutModule';
import {MarketplaceIntegrations} from './integrations/marketplaceIntegrations';
import {IntegrationSubscribeModal} from '@app/components/marketplace/integrations/subscribe-modal/subscribe-modal';
import {MarketplaceModules} from '@app/components/marketplace/modules/marketplaceModules';
import {ModuleSubscribeModal} from '@app/components/marketplace/modules/subscribe-modal/subscribe-modal';

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
        MarketplaceModules,
        MarketplaceIntegrations,
        IntegrationSubscribeModal,
        ModuleSubscribeModal,
    ],
    entryComponents: [
        IntegrationSubscribeModal,
        ModuleSubscribeModal,
    ],
})
export class MarketplaceModule {}
