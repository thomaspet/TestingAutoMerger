import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {IModalOptions, IUniModal, UniModalService, ManageProductsModal} from '@uni-framework/uni-modal';
import {ElsaProduct} from '@app/services/elsa/elsaModels';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {Company} from '@app/unientities';
import {ElsaProductService} from '@app/services/elsa/elsaProductService';

@Component({
    selector: 'uni-module-subscribe-modal',
    templateUrl: './subscribe-modal.html',
    styleUrls: ['./subscribe-modal.sass']
})
export class ModuleSubscribeModal implements IUniModal, OnInit {
    @Input() options: IModalOptions = {};

    @Output() onClose: EventEmitter<void> = new EventEmitter<void>();

    product: ElsaProduct;

    constructor(
        private modalService: UniModalService,
        private browserStorage: BrowserStorageService,
        private elsaProductService: ElsaProductService,
    ) {}

    ngOnInit() {
        this.product = this.options.data;
    }

    editPurchases() {
        const company: Company = this.browserStorage.getItem('activeCompany');
        this.modalService
            .open(ManageProductsModal, {
                header: `Velg hvilke brukere som skal ha hvilke produkter i ${company.Name}`,
                data: {companyKey: company.Key},
            });
        this.onClose.emit();
    }

    close() {
        this.onClose.emit();
    }

    priceText(product: ElsaProduct): string {
        return this.elsaProductService.ProductTypeToPriceText(product);
    }
}
