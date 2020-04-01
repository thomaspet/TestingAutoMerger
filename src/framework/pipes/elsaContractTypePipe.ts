import {Pipe, PipeTransform} from '@angular/core';
import {ElsaContractType} from '@app/models';

@Pipe({name: 'elsaContractType'})
export class ElsaContractTypePipe implements PipeTransform {
    transform(value: ElsaContractType): string {
        switch (value) {
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
                return '';
        }
    }
}
