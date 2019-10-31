import {Component, EventEmitter, OnInit} from '@angular/core';
import {
    IModalOptions,
    IUniModal,
    UniModalService,
    ProductPurchasesModal,
} from '@uni-framework/uni-modal';
import {ElsaProduct, ElsaProductType, ElsaProductStatusCode, ElsaAgreementStatus} from '@app/models';
import {ElsaProductService} from '@app/services/elsa/elsaProductService';
import {ElsaPurchaseService, ErrorService, ElsaAgreementService} from '@app/services/services';
import {ElsaPurchase} from '@app/models';
import * as marked from 'marked';

@Component({
    selector: 'uni-product-subscribe-modal',
    templateUrl: './subscribe-modal.html',
    styleUrls: ['./subscribe-modal.sass']
})
export class SubscribeModal implements IUniModal, OnInit {
    options: IModalOptions = {};
    onClose: EventEmitter<any> = new EventEmitter();

    product: ElsaProduct;
    canPurchaseProducts: boolean;
    missingPermissionText: string;
    busy: boolean;
    isConsentStep = false;

    htmlContent: string;
    videoMarkup: string;

    isIntegration: boolean;

    action: {
        label: string,
        click: () => void
    };

    hasValidClientId: boolean;

    constructor(
        private errorService: ErrorService,
        private modalService: UniModalService,
        private elsaProductService: ElsaProductService,
        private elsaPurchaseService: ElsaPurchaseService,
        private elsaAgreementService: ElsaAgreementService,
    ) {
        const renderer = new marked.Renderer();
        renderer.link = function(href, title, text) {
            const link = marked.Renderer.prototype.link.apply(this, arguments);
            return link.replace('<a', '<a target="_blank"');
        };

        marked.setOptions({renderer: renderer});
    }

    ngOnInit() {
        const data = this.options.data || {};
        this.product = data.product;
        this.canPurchaseProducts = data.canPurchaseProducts;

        // client id placeholder should be higher than 4 chars
        this.hasValidClientId =  data.product.ClientID && data.product.ClientID.length > 4;

        this.isIntegration = this.product.ProductType === ElsaProductType.Integration;

        if (this.product.MarkdownContent) {
            try {
                const decoded = decodeURI(this.product.MarkdownContent);
                this.htmlContent = marked.parse(decoded) || '';
            } catch (e) {
                console.error(e);
            }
        }

        if (this.product.VideoUrl) {
            this.videoMarkup = this.getVideoMarkup(this.product.VideoUrl);
        }

        if (!data.canPurchaseProducts) {
            this.missingPermissionText = 'Du må være administrator for å kjøpe produkter';
        }

        if (this.product.IsPerUser) {
            this.action = {
                label: 'Velg brukere',
                click: () => this.manageUserPurchases()
            };
        } else {
            if (this.product['_isBought']) {
                this.action = this.product['_activationFunction'];
            } else {
                if (this.product.ProductType === ElsaProductType.Integration) {
                    const purchasable = this.product.ProductStatus === ElsaProductStatusCode.Live
                        && this.product.ClientID;

                    if (purchasable) {
                        this.action = {
                            label: 'Aktiver integrasjon',
                            click: () => this.purchaseProduct()
                        };
                    }
                } else {
                    this.action = {
                        label: 'Kjøp produkt',
                        click: () => this.purchaseProduct()
                    };
                }
            }
        }
    }

    manageUserPurchases() {
        if (this.canPurchaseProducts) {
            this.modalService.open(ProductPurchasesModal, {
                closeOnClickOutside: true,
                data: {
                    product: this.product
                },
            });

            this.onClose.emit();
        }
    }

    onPurchaseClick() {
        if (!this.isConsentStep
            && this.product.ProductAgreement
            && this.product.ProductAgreement.StatusCode === ElsaAgreementStatus.Active
        ) {
            this.elsaAgreementService.GetByProductID(this.product.ID).subscribe(
                agreement => {
                    if (agreement && agreement.AgreementText) {
                        try {
                            const decoded = decodeURI(agreement.AgreementText);
                            this.htmlContent = marked.parse(decoded) || '';
                            this.isConsentStep = true;
                        } catch (err) {
                            console.error(err);
                        }
                    }
                },
                err => this.errorService.handle(err)
            );
        } else {
            this.action.click();
        }
    }

    purchaseProduct() {
        if (!this.busy && this.canPurchaseProducts) {
            this.busy = true;
            const purchase: ElsaPurchase = {
                ID: null,
                ProductID: this.product.ID
            };

            this.elsaPurchaseService.massUpdate([purchase]).subscribe(
                () => {
                    this.busy = false;
                    this.product['_isBought'] = true;
                    this.action = this.product['_activationFunction'];
                    if (this.action) {
                        this.action.click();
                    }
                    this.onClose.emit();
                },
                err => {
                    this.errorService.handle(err);
                    this.busy = false;
                }
            );
        }
    }

    priceText(product: ElsaProduct): string {
        return this.elsaProductService.ProductTypeToPriceText(product);
    }

    private getVideoMarkup(videoUrl: string) {
        try {
            let videoCode;
            if (videoUrl.includes('youtu.be/')) {
                videoCode = videoUrl.split('youtu.be/')[1];
            } else if (videoUrl.includes('v=')) {
                const codePart = videoUrl.split('v=')[1];
                videoCode = codePart.split('&')[0];
            } else if (videoUrl.includes('/embed/')) {
                videoCode = videoUrl.split('/embed/')[1];
            }

            if (videoCode) {
                return `
                    <iframe
                        src="https://www.youtube.com/embed/${videoCode}"
                        width="560"
                        height="315"
                        frameborder="0"
                        allow="accelerometer;
                        autoplay;
                        encrypted-media;
                        gyroscope;
                        picture-in-picture"
                        allowfullscreen>
                    </iframe>
                `;
            }
        } catch (err) {
            console.error(err);
        }
    }
}
