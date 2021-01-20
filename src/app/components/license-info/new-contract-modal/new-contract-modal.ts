import {Component, ViewChild, ElementRef, EventEmitter} from '@angular/core';
import {theme, THEMES} from 'src/themes/theme';
import {AuthService} from '@app/authService';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import { ElsaContractService, ElsaCustomersService, ErrorService } from '@app/services/services';
import { ElsaContract, ElsaContractType } from '@app/models';
import {ISelectConfig} from '@uni-framework/ui/uniform';

@Component({
    selector: 'new-contract-modal',
    templateUrl: './new-contract-modal.html',
    styleUrls: ['./new-contract-modal.sass']
})
export class NewContractModal implements IUniModal {
    onClose = new EventEmitter();
    busy: boolean;
    contractName: string;
    contractTypes: ElsaContractType[];
    options: IModalOptions = {};
    selectedContractType: ElsaContractType;

    config = <ISelectConfig>{
        template: contractType => contractType.Label,
        searchable: false,
        hideDeleteButton: true
    };

    constructor(
        private authService: AuthService,
        private elsaContractService: ElsaContractService,
        private elsaCustomersService: ElsaCustomersService,
        private errorService: ErrorService,
    ) {}

    ngOnInit() {
        this.busy = true;
        this.elsaContractService.getCustomContractTypes().subscribe(
            contractTypes => {
                this.contractTypes = contractTypes;
                this.selectedContractType = contractTypes[0];
                this.busy = false;
            },
            err => {
                this.busy = false;
                this.errorService.handle(err);
            }
        );
    }

    createContract() {
        this.busy = true;
        const contract = <ElsaContract>{};
        contract.Name = this.contractName;
        contract.ContractType = this.selectedContractType.ContractType;
        contract.CustomerID = this.options.data.customerID;
        this.elsaContractService.createContract(contract).subscribe(
            newContract => {
                this.busy = false;
                this.onClose.emit(newContract);
            },
            err => {
                this.busy = false;
                this.errorService.handle(err);
            }
        );
    }

    contractTypeChange(contractType) {
        this.selectedContractType = contractType;
    }
}
