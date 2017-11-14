import {Component} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'uni-marketplace-webinars',
    templateUrl: './marketplaceWebinars.html'
})
export class MarketplaceWebinars {
    constructor(
        tabService: TabService
    ) {
        tabService.addTab({
            name: 'Markedsplass', url: '/marketplace/webinars', moduleID: UniModules.Marketplace, active: true
        });
    }
}
