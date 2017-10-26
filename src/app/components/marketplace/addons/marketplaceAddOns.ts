import {Component, AfterViewInit} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {Router} from '@angular/router';
import {AdminProductService, AdminProduct} from '../../../services/admin/adminProductService';
import {ErrorService} from '../../../services/common/errorService';
import {Observable} from 'rxjs/Observable';



@Component({
    selector: 'uni-marketplace-add-ons',
    templateUrl: './marketplaceAddOns.html'
})
export class MarketplaceAddOns implements AfterViewInit {
    public products$: Observable<AdminProduct[]>;

    constructor(
        tabService: TabService,
        private adminProductService: AdminProductService,
        private errorService: ErrorService,
        private router: Router
    ) {
        tabService.addTab({ name: 'Markedsplass', url: '/marketplace/add-ons', moduleID: UniModules.Marketplace, active: true });
    }

    ngAfterViewInit() {
        this.products$ = this.adminProductService
            .GetAll()
            .map(products => this.adminProductService.maxChar(products, 100))
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    public navigateTo(url: string) {
        this.router.navigateByUrl(url);
    }
}
