import {Component, Input, Output, EventEmitter, HostBinding} from '@angular/core'
import {ElsaContractType, ElsaProduct, ElsaProductType} from '@app/models';

@Component({
    selector: 'contract-type-card',
    templateUrl: './contract-type-card.html',
    styleUrls: ['./contract-type-card.sass'],
})
export class ContractTypeCard {
    @Input() contractType: ElsaContractType;
    @Input() disabled: boolean;
    @Input() active: boolean;
    @Input() buttonClass: string;
    @Input() buttonLabel: string;

    @HostBinding('class.recommended')
    @Input() recommended: boolean;

    @Output() selected = new EventEmitter();

    product: ElsaProduct;

    ngOnChanges(changes) {
        if (changes['contractType'] && this.contractType) {
            const productContractType = this.contractType.ProductContractTypes.find(pct => {
                return pct.Product?.ProductType === ElsaProductType.Package;
            });

            if (productContractType) {
                this.product = productContractType.Product;
            }
        }
    }
}
