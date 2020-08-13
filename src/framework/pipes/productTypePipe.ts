import {Pipe, PipeTransform} from '@angular/core';
import {ElsaProductType} from '@app/models';

@Pipe({name: 'producttype'})
export class ProductTypePipe implements PipeTransform {

    constructor() {}
    public transform(value: number): string {
        let type = '';
        switch (value) {
            case ElsaProductType.Module: type = 'Modul'; break;
            case ElsaProductType.Integration: type = 'Integrasjon'; break;
            case ElsaProductType.Extension: type = 'Utvidelse'; break;
            case ElsaProductType.Bundle: type = 'Bundle'; break;
            case ElsaProductType.BankProduct: type = 'Bankprodukt'; break;
            case ElsaProductType.Package: type = 'Pakke'; break;
        }
        return type;
    }
}
