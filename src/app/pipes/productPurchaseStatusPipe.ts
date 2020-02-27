import {Pipe, PipeTransform} from '@angular/core';
import {ElsaPurchaseStatus} from '@app/models';

@Pipe({name: 'productpurchasestatus'})
export class ProductPurchaseStatusPipe implements PipeTransform {

    constructor() {}
    public transform(value: number): string {
        let status = '';
        switch (value) {
            case ElsaPurchaseStatus.Accepted: status = 'Aktiv'; break;
            case ElsaPurchaseStatus.Pending: status = 'Avventer'; break;
            case ElsaPurchaseStatus.Rejected: status = 'Avvist'; break;
        }
        return status;
    }
}
