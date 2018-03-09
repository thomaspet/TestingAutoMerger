import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';

export interface ElsaPurchase {
    id: number;
    contract?: null;
    contractID: number;
    startDate: string;
    endDate?: null;
    userLimit: number;
    key: string;
    product?: null;
    productID: number;
    companyPurchases?: null;
}

@Injectable()
export class ElsaPurchasesService {
    constructor(private uniHttp: UniHttp) {}

    public Get(id: number): Observable<ElsaPurchase> {
        return this.uniHttp
            .asGET()
            .usingAdminDomain()
            .withEndPoint(`/api/purchases/${id}`)
            .send()
            .map(response => response.json());
    }

    public GetAll(): Observable<ElsaPurchase[]> {
        return this.uniHttp
            .asGET()
            .usingAdminDomain()
            .withEndPoint('/api/purchases')
            .send()
            .map(response => response.json());
    }
}
