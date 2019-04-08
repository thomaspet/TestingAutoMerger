import {Component, Output, EventEmitter, Input} from '@angular/core';
import {ElsaCustomer, ElsaContractType, ElsaContract} from '@app/models';

@Component({
  selector: 'uni-select-license',
  templateUrl: './select-license.component.html',
  styleUrls: ['./select-license.component.sass'],
})
export class SelectLicenseComponent {
    @Input() customers: ElsaCustomer[];
    @Input() selectedContract: ElsaContract;
    @Output() selectedContractChange = new EventEmitter();

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
