import {Component, Output, EventEmitter, Input, OnInit} from '@angular/core';
import {ElsaCustomer, ElsaContractType} from '@app/models';
import {ElsaCustomersService} from '@app/services/elsa/elsaCustomersService';
import {ErrorService} from '@app/services/common/errorService';

@Component({
  selector: 'uni-select-license',
  templateUrl: './select-license.component.html',
  styleUrls: ['./select-license.component.sass'],
})
export class SelectLicenseComponent implements OnInit {
    @Input() contractID: number;
    @Output() contractIDChange = new EventEmitter<number>();

    customers: ElsaCustomer[];

    constructor(
        private errorService: ErrorService,
        private elsaCustomersService: ElsaCustomersService,
    ) {}

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

    ngOnInit() {
        this.elsaCustomersService.GetAll().subscribe(
            (customers: ElsaCustomer[]) => this.customers = customers,
            err => this.errorService.handle(err),
        );
    }
}
