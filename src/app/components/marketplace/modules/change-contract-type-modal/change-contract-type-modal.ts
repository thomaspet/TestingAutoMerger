import {Component, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {ErrorService, ElsaContractService} from '@app/services/services';
import {ElsaContractType, ElsaProduct, ElsaProductType} from '@app/models';
import {theme, THEMES} from 'src/themes/theme';


@Component({
    selector: 'change-contract-type-modal',
    templateUrl: './change-contract-type-modal.html',
    styleUrls: ['./change-contract-type-modal.sass']
})
export class ChangeContractTypeModal implements IUniModal {
    options: IModalOptions = {};
    onClose = new EventEmitter();

    isBrunoEnv = theme.theme === THEMES.EXT02;

    busy: boolean;
    upgradeSuccessful: boolean;

    contractType: ElsaContractType;
    product: ElsaProduct;

    constructor(
        private errorService: ErrorService,
        private contractService: ElsaContractService,
    ) {}

    ngOnInit() {
        this.contractType = this.options.data;
        if (this.contractType) {
            const productContractType = this.contractType.ProductContractTypes.find(pct => {
                return pct.Product?.ProductType === ElsaProductType.Package;
            });

            if (productContractType) {
                this.product = productContractType.Product;
            }
        }
    }

    changeContractType() {
        this.busy = true;

        this.contractService.changeContractType(this.contractType.ContractType).subscribe(
            () => {
                this.busy = false;
                this.upgradeSuccessful = true;
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    reload() {
        window.location.reload();
    }
}
