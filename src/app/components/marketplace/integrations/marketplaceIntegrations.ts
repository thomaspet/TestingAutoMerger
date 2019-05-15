import {Component, OnInit, Pipe, PipeTransform} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniModalService} from '@uni-framework/uni-modal';
import {SubscribeModal} from '@app/components/marketplace/subscribe-modal/subscribe-modal';
import {ElsaProductService} from '@app/services/elsa/elsaProductService';
import {ElsaProduct, ElsaProductType, ElsaProductStatusCode} from '@app/models';
import {ErrorService} from '@app/services/common/errorService';

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

    constructor(
        tabService: TabService,
        private modalService: UniModalService,
        private elsaProductService: ElsaProductService,
        private errorService: ErrorService,
    ) {
        tabService.addTab({
            name: 'Markedsplass', url: '/marketplace/integrations', moduleID: UniModules.Marketplace, active: true
        });
    }

    ngOnInit() {
        const isIntegration = product => product.ProductType === ElsaProductType.Integration;
        const isActive = product => product.ProductStatus === ElsaProductStatusCode.Live;
        const isUpcoming = product => product.ProductStatus === ElsaProductStatusCode.SoonToBeLaunched;
        const isCandidate = product => product.ProductStatus === ElsaProductStatusCode.DevelopmentCandidate;
        this.elsaProductService.GetAll().subscribe(
            products => {
                const integrations = products.filter(isIntegration);
                this.activeIntegrations = integrations.filter(isActive);
                this.upcomingIntegrations = integrations.filter(isUpcoming);
                this.candidateIntegrations = integrations.filter(isCandidate);

            },
            err => this.errorService.handle(err),
        );
    }

    navigateToExternalUrl(url: string) {
        window.location.href = url;
    }

    openSubscribeModal(integrationItem: ElsaProduct) {
        return this.modalService.open(SubscribeModal, {
            data: {
                product: integrationItem
            }
        });
    }
}
