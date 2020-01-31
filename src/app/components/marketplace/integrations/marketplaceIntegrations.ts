import {Component, OnInit, Pipe, PipeTransform} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniModalService} from '@uni-framework/uni-modal';
import {SubscribeModal} from '@app/components/marketplace/subscribe-modal/subscribe-modal';
import {ElsaProduct, ElsaProductType, ElsaProductStatusCode} from '@app/models';
import {
    UserRoleService,
    ElsaProductService,
    ErrorService,
    ElsaPurchaseService,
    PageStateService,
    CompanySettingsService
} from '@app/services/services';
import {forkJoin} from 'rxjs';
import {AuthService} from '@app/authService';
import {theme, THEMES} from 'src/themes/theme';

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
    isUEEnvironment = theme.theme === THEMES.UE;

    activeIntegrations: ElsaProduct[];
    upcomingIntegrations: ElsaProduct[];
    searchText: string = '';
    canPurchaseProducts: boolean;
    hasOrgNr: boolean;
    toolbarHeader: string = 'NAVBAR.INTEGRATION';

    constructor(
        private tabService: TabService,
        private authService: AuthService,
        private modalService: UniModalService,
        private elsaProductService: ElsaProductService,
        private elsaPurchaseService: ElsaPurchaseService,
        private userRoleService: UserRoleService,
        private errorService: ErrorService,
        private route: ActivatedRoute,
        private companySettingsService: CompanySettingsService,
        private pageStateService: PageStateService
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {

            let products = 'integrations';
            let filter = '';
            this.toolbarHeader = 'NAVBAR.INTEGRATION';
            let filterValue = ElsaProductType.Integration;

            if (params && params['products']) {
                products = params['products'];
            }

            // Should only hit here if SR-environment, ProductType is BankProduct
            if (products === 'bank') {
                filter = `ProductType eq 'BankProduct'`;
                this.toolbarHeader = 'NAVBAR.BANK_PRODUCTS';
                filterValue = ElsaProductType.BankProduct;
            }

            this.tabService.addTab({
                name: this.toolbarHeader,
                url: this.pageStateService.getUrl(),
                moduleID: UniModules.Marketplace,
                active: true
            });

            forkJoin(
                this.userRoleService.hasAdminRole(this.authService.currentUser.ID),
                this.elsaPurchaseService.getAll(),
                this.elsaProductService.GetAll(filter),
                this.companySettingsService.Get(1),
            ).subscribe(
                res => {
                    this.canPurchaseProducts = res[0];

                    const purchases = res[1] || [];
                    const integrations = (res[2] || [])
                        .filter(p => p.ProductType === filterValue)
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

                    this.hasOrgNr = !!res[3].OrganizationNumber;
                },
                err => this.errorService.handle(err)
            );
        });
    }

    openSubscribeModal(integrationItem: ElsaProduct) {
        return this.modalService.open(SubscribeModal, {
            data: {
                canPurchaseProducts: this.canPurchaseProducts,
                product: integrationItem,
                hasOrgNr: this.hasOrgNr
            }
        });
    }
}
