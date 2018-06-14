import {Component, AfterViewInit} from '@angular/core';
import {Router} from '@angular/router';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ElsaProductService, ElsaProduct, ErrorService} from '@app/services/services';
import {Observable} from 'rxjs/Observable';


@Component({
    selector: 'uni-marketplace-add-ons',
    templateUrl: './marketplaceAddOns.html'
})
export class MarketplaceAddOns implements AfterViewInit {
    public products$: Observable<ElsaProduct[]>;

    constructor(
        tabService: TabService,
        private elsaProductService: ElsaProductService,
        private errorService: ErrorService,
        private router: Router
    ) {
        tabService.addTab({
            name: 'Markedsplass', url: '/marketplace/add-ons', moduleID: UniModules.Marketplace, active: true
        });
    }

    public ngAfterViewInit() {
        this.products$ = this.elsaProductService
            .GetAll()
            .map(products => this.elsaProductService.maxChar(products, 100))
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    public navigateTo(url: string) {
        this.router.navigateByUrl(url);
    }
}
