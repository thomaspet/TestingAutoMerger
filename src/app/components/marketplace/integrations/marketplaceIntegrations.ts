import {Component, OnInit} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniModalService} from '@uni-framework/uni-modal';
import {IntegrationSubscribeModal} from '@app/components/marketplace/integrations/subscribe-modal/subscribe-modal';
import {ElsaProductService} from '@app/services/elsa/elsaProductService';
import {ElsaProduct, ElsaProductType, ElsaProductStatusCode} from '@app/services/elsa/elsaModels';
import {ErrorService} from '@app/services/common/errorService';

@Component({
    selector: 'uni-marketplace-integrations',
    templateUrl: './marketplaceIntegrations.html',
    styleUrls: ['./marketplaceIntegrations.sass'],
})
export class MarketplaceIntegrations {

    activeIntegrations: ElsaProduct[];
    upcomingIntegrations: ElsaProduct[];
    candidateIntegrations: ElsaProduct[];
    filteredActiveIntegrations: ElsaProduct[];
    filteredUpcomingIntegrations: ElsaProduct[];
    filteredCandidateIntegrations: ElsaProduct[];

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
        const isIntegration = product => product.productType === ElsaProductType.Integration;
        const isActive = product => product.productStatus === ElsaProductStatusCode.Live;
        const isUpcoming = product => product.productStatus === ElsaProductStatusCode.SoonToBeLaunched;
        const isCandidate = product => product.productStatus === ElsaProductStatusCode.DevelopmentCandidate;
        this.elsaProductService.GetAll()
            .subscribe(
                products => {
                    const integrations = products.filter(isIntegration);
                    this.filteredActiveIntegrations = this.activeIntegrations = integrations.filter(isActive);
                    this.filteredUpcomingIntegrations = this.upcomingIntegrations = integrations.filter(isUpcoming);
                    this.filteredCandidateIntegrations = this.candidateIntegrations = integrations.filter(isCandidate);

                },
                err => this.errorService.handle(err),
            );
    }

    search(searchText: string) {
        this.filteredActiveIntegrations = this.activeIntegrations
            .filter(integration => integration.name.toLowerCase().includes(searchText.toLowerCase()));
        this.filteredUpcomingIntegrations = this.upcomingIntegrations
            .filter(integration => integration.name.toLowerCase().includes(searchText.toLowerCase()));
        this.filteredCandidateIntegrations = this.candidateIntegrations
            .filter(integration => integration.name.toLowerCase().includes(searchText.toLowerCase()));
    }

    navigateToExternalUrl(url: string) {
        window.location.href = url;
    }

    openSubscribeModal(integrationItem: ElsaProduct) {
        return this.modalService.open(IntegrationSubscribeModal, {data: integrationItem}).onClose
            .subscribe(
                () => {},
                err => console.error(err),
            );
    }
}
