import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'AnnualSettlementGetIcon',
    pure: true
})
export class AnnualSettlementGetIconPipe implements PipeTransform {
    public transform(value: any, ...args): any {
        return value.AccountYear < 2020 ? 'done' : 'create';
    }
}
