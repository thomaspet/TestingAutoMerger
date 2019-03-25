import { Injectable } from '@angular/core';
import { ElsaPurchaseService } from '../elsa/elsaPurchasesService';
import { Observable } from 'rxjs';

@Injectable()
export class VIPPSService {

    constructor(private elsaPurchasesService: ElsaPurchaseService) { }

    public isActivated(productName: string): Observable<boolean> {
        return this.elsaPurchasesService.getPurchaseByProductName(productName)
            .map(res => !!res);
    }
}
