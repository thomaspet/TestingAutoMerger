import { Injectable } from '@angular/core';
import { ElsaProductService } from '../elsa/elsaProductService';
import { ElsaPurchaseService } from '../elsa/elsaPurchasesService';
import { Observable } from 'rxjs';

@Injectable()
export class VIPPSService {

    constructor(private elsaProductService: ElsaProductService, private elsaPurchasesService: ElsaPurchaseService) { }

    public isActivated(productName: string): Observable<boolean> {
        return this.elsaProductService.FindProductByName(productName).switchMap(product => {
            return this.elsaPurchasesService.GetAll().map(purchases => {
                return purchases.some(purchase => purchase.productID === product.id);
            });
        });
    }
}
