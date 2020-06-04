import {Pipe, PipeTransform} from '@angular/core';
import {ContractType} from '@app/models';

@Pipe({name: 'elsaContractType'})
export class ElsaContractTypePipe implements PipeTransform {
    transform(value: ContractType): string {
        switch (value) {
            case ContractType.Demo:
                return 'Demo';
            case ContractType.Internal:
                return 'Intern';
            case ContractType.Partner:
                return 'Partner';
            case ContractType.Pilot:
                return 'Pilot';
            case ContractType.Training:
                return 'Training';
            case ContractType.Standard:
                return 'Standard';
            case ContractType.Bureau:
                return 'Byrå';
            case ContractType.NonProfit:
                return 'Non-profit';
            default:
                return '';
        }
    }
}
