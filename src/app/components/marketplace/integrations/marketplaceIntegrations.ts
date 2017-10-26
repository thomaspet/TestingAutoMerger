import {Component} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'uni-marketplace-integrations',
    templateUrl: './marketplaceIntegrations.html'
})
export class MarketplaceIntegrations {
    constructor(
        tabService: TabService
    ) {
        tabService.addTab({ name: 'Markedsplass', url: '/marketplace/integrations', moduleID: UniModules.Marketplace, active: true });
    }

    public navigateToExternalUrl(url: string) {
        window.location.href = url;
    }
}
