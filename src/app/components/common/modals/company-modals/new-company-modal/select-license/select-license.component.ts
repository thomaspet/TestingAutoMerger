import {Component, Output, EventEmitter, Input} from '@angular/core';
import {ElsaCustomer, ElsaContract} from '@app/models';
import {ElsaCustomersService} from '@app/services/services';

@Component({
    selector: 'uni-select-license',
    templateUrl: './select-license.component.html',
    styleUrls: ['./select-license.component.sass'],
})
export class SelectLicenseComponent {
    @Input() selectedContract: ElsaContract;
    @Input() currentContractID: number;
    @Output() selectedContractChange = new EventEmitter();

    customers: ElsaCustomer[] = [];

    busy = false;

    constructor(private elsaCustomersService: ElsaCustomersService) {}

    ngOnInit() {
        this.busy = true;
        this.elsaCustomersService.getAll('Contracts').subscribe(
            (customers: ElsaCustomer[]) => {
                this.customers = customers;

                if (this.currentContractID) {
                    this.customers.forEach(customer => {
                        const contract = customer.Contracts.find(c => c.ID === this.currentContractID);
                        if (contract) {
                            this.selectContract(contract);
                        }
                    });
                }
                this.busy = false;
            },
            err => {
                this.busy = false;
            }
        );
    }

    selectContract(contract) {
        this.selectedContract = contract;
        this.selectedContractChange.emit(this.selectedContract);
    }
}
