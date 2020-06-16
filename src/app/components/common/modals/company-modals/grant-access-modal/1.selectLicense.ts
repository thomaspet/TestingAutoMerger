import {Component, Output, EventEmitter, Input} from '@angular/core';
import {ElsaCustomer, ElsaContract} from '@app/models';
import {ElsaCustomersService} from '@app/services/elsa/elsaCustomersService';
import {ErrorService} from '@app/services/common/errorService';
import {GrantAccessData} from './grant-access-modal';

@Component({
    selector: 'select-license-for-bulk-access',
    templateUrl: './1.selectLicense.html',
    styleUrls: ['./grant-access-modal.sass']
})
export class SelectLicenseForBulkAccess {
    @Input() initData;
    @Input() data: GrantAccessData;
    @Output() stepComplete: EventEmitter<boolean> = new EventEmitter();

    customers: ElsaCustomer[];
    selectedContractID: number;
    busy = false;

    constructor(
        private errorService: ErrorService,
        private elsaCustomersService: ElsaCustomersService,
    ) {}

    ngOnInit() {
        this.busy = true;
        this.elsaCustomersService.getAll('Contracts').subscribe(
            (customers: ElsaCustomer[]) => {
                this.customers = customers;

                if (this.initData && this.initData.contractID) {
                    this.customers.forEach(customer => {
                        const contract = customer.Contracts.find(c => c.ID === this.initData.contractID);
                        if (contract) {
                            this.selectContract(contract);
                        }
                    });
                }
                this.busy = false;
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    selectContract(contract: ElsaContract) {
        this.selectedContractID = contract.ID;

        const selectedCustomer = this.customers.find(customer => {
            return customer.Contracts && customer.Contracts.some(c => c.ID === contract.ID);
        });

        this.data.customer = selectedCustomer;
        this.data.contract = contract;
        this.data.StoredData = <any>{};
        this.data.companies = undefined;
        this.data.users = undefined;
        this.data.products = undefined;
        this.data.AddAdministratorRole = false;

        this.stepComplete.emit(true);
    }
}
