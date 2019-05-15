import {Component, OnInit, Pipe, PipeTransform} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniModalService} from '@uni-framework/uni-modal';
import {SubscribeModal} from '@app/components/marketplace/subscribe-modal/subscribe-modal';
import {ElsaProduct, ElsaProductType, ElsaProductStatusCode} from '@app/models';
import {UserRoleService, ElsaProductService, ErrorService, ElsaPurchaseService} from '@app/services/services';
import { forkJoin } from 'rxjs';
import { AuthService } from '@app/authService';

@Pipe({name: 'filterIntegrations'})
export class FilterIntegrationsPipe implements PipeTransform {
    transform(integrations: ElsaProduct[], searchText: string): ElsaProduct[] {
        return (integrations || []).filter(integration => {
            return (integration.Label || '').toLowerCase().includes(searchText.toLowerCase())
                || (integration.CategoryName || '').toLowerCase().includes(searchText.toLowerCase())
                || (integration.Tags || []).find(tag => (tag || '').toLowerCase().includes(searchText.toLowerCase()))
                || (integration.Description || '').toLowerCase().includes(searchText.toLowerCase())
                || (integration.HtmlContent || '').toLowerCase().includes(searchText.toLowerCase());
        });
    }
}

@Component({
    selector: 'uni-marketplace-integrations',
    templateUrl: './marketplaceIntegrations.html',
    styleUrls: ['./marketplaceIntegrations.sass'],
})
export class MarketplaceIntegrations implements OnInit {
    activeIntegrations: ElsaProduct[];
    upcomingIntegrations: ElsaProduct[];
    candidateIntegrations: ElsaProduct[];
    searchText: string = '';
    canPurchaseProducts: boolean;

    constructor(
        tabService: TabService,
        private authService: AuthService,
        private modalService: UniModalService,
        private elsaProductService: ElsaProductService,
        private elsaPurchaseService: ElsaPurchaseService,
        private userRoleService: UserRoleService,
        private errorService: ErrorService,
    ) {
        tabService.addTab({
            name: 'Markedsplass', url: '/marketplace/integrations', moduleID: UniModules.Marketplace, active: true
        });
    }

    ngOnInit() {
        forkJoin(
            this.userRoleService.hasAdminRole(this.authService.currentUser.ID),
            this.elsaPurchaseService.getAll(),
            this.elsaProductService.GetAll()
        ).subscribe(
            res => {
                this.canPurchaseProducts = res[0];

                const purchases = res[1] || [];
                const integrations = (res[2] || [])
                    .filter(p => p.ProductType === ElsaProductType.Integration)
                    .map(integration => {
                        integration['_isBought'] = purchases.some(p => p.ProductID === integration.ID);
                        return integration;
                    });

                this.activeIntegrations = integrations.filter(i => {
                    return i.ProductStatus === ElsaProductStatusCode.Live;
                });

                this.upcomingIntegrations = integrations.filter(i => {
                    return i.ProductStatus === ElsaProductStatusCode.SoonToBeLaunched;
                });

                this.candidateIntegrations = integrations.filter(i => {
                    return i.ProductStatus === ElsaProductStatusCode.DevelopmentCandidate;
                });
            },
            err => this.errorService.handle(err)
        );
    }

    openSubscribeModal(integrationItem: ElsaProduct) {
        return this.modalService.open(SubscribeModal, {
            data: {
                canPurchaseProducts: this.canPurchaseProducts,
                product: integrationItem
            }
        });
    }
}
