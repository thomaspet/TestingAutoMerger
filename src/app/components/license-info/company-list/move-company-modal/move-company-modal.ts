import { Component, EventEmitter, OnInit } from '@angular/core';
import { IUniModal, IModalOptions } from '@uni-framework/uni-modal/interfaces';
import { ErrorService, CompanyService } from '@app/services/services';
import { ElsaCompanyLicense, ElsaContract, ElsaCustomer } from '@app/models';
import {ISelectConfig} from '@uni-framework/ui/uniform';
import {ElsaContractTypePipe} from '@uni-framework/pipes/elsaContractTypePipe';

interface SelectCustomerContract {
    CustomerID: number;
    CustomerName: string;
    ContractID: number;
    ContractName: string;
    ContractType: number;
    DisplayValue: string;
}

@Component({
    selector: 'uni-move-company-modal',
    templateUrl: './move-company-modal.html',
})
export class MoveCompanyModal implements IUniModal, OnInit {
    options: IModalOptions = {};
    onClose: EventEmitter<boolean> = new EventEmitter();
    company: ElsaCompanyLicense;
    customers: ElsaCustomer[];
    selectableItems: SelectCustomerContract[] = [];
    selectedItem: SelectCustomerContract;
    busy: boolean;

    config = <ISelectConfig>{
        template: item => item.DisplayValue,
        searchable: true,
        hideDeleteButton: true,
        dropdownMaxHeight: '20rem',
    };

    constructor(
        private errorService: ErrorService,
        private companyService: CompanyService,
        private elsaContractTypePipe: ElsaContractTypePipe,
    ) { }

    ngOnInit() {
        this.company = this.options.data.company || {};
        this.customers = this.options.data.customers || [];

        this.customers.forEach(customer => {
            customer.Contracts.forEach(contract => {
                if (this.company.ContractID !== contract.ID) {
                    this.selectableItems.push({
                        CustomerID: customer.ID,
                        CustomerName: customer.Name,
                        ContractID: contract.ID,
                        ContractName: contract.Name,
                        ContractType: contract.ContractType,
                        DisplayValue: `${contract.Name || customer.Name} - (${this.elsaContractTypePipe.transform(contract.ContractType)})`
                    });
                }
            });
        });
        
    }

    onSelect(selected) {
        this.selectedItem = selected;
    }

    moveCompany() {
        this.busy = true;
        this.companyService.moveCompanyLicense(this.company.ID, this.selectedItem.CustomerID, this.selectedItem.ContractID)
            .subscribe(() => {
                this.busy = false;
                this.onClose.emit(true);
            },
            err => {
                this.busy = false;
                this.errorService.handle(err);
            });
    }
}
