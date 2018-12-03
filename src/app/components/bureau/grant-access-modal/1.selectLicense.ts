import {Component, Output, EventEmitter, Input} from '@angular/core';
import {ElsaCustomer, ElsaContractType, ElsaContract} from '@app/models';
import {ElsaCustomersService} from '@app/services/elsa/elsaCustomersService';
import {ErrorService} from '@app/services/common/errorService';
import {GrantAccessData} from '@app/components/bureau/grant-access-modal/grant-access-modal';

@Component({
    selector: 'select-license-for-bulk-access',
    templateUrl: './1.selectLicense.html',
    styleUrls: ['./grant-access-modal.sass']
})
export class SelectLicenseForBulkAccess {
    @Input() data: GrantAccessData;
    @Output() stepComplete: EventEmitter<boolean> = new EventEmitter();

    customers: ElsaCustomer[];
    selectedContractID: number;

    constructor(
        private errorService: ErrorService,
        private elsaCustomersService: ElsaCustomersService,
    ) {}

    ngOnInit() {
        this.elsaCustomersService.GetAll().subscribe(
            (customers: ElsaCustomer[]) => {
                this.customers = customers;
            },
            err => this.errorService.handle(err),
        );
    }

    selectContract(contract: ElsaContract) {
        this.selectedContractID = contract.id;

        this.data.contract = contract;
        this.data.companies = undefined;
        this.data.products = undefined;

        this.stepComplete.emit(true);
    }

    contractTypeToText(contractType: ElsaContractType): string {
        switch (+contractType) {
            case ElsaContractType.Demo:
                return 'Demo';
            case ElsaContractType.Internal:
                return 'Intern';
            case ElsaContractType.Partner:
                return 'Partner';
            case ElsaContractType.Pilot:
                return 'Pilot';
            case ElsaContractType.Training:
                return 'Training';
            case ElsaContractType.Standard:
                return 'Standard';
            case ElsaContractType.Bureau:
                return 'Byrå';
            case ElsaContractType.NonProfit:
                return 'Non-profit';
            default:
                return 'N/A';
        }
    }
}
