import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {ElsaCustomer} from '@app/models';

@Injectable()
export class ElsaCustomersService {
    constructor(private uniHttp: UniHttp) {}

    getByContractID(contractID: number): Observable<ElsaCustomer> {
        return this.uniHttp.asGET()
            .usingEmptyDomain()
            .withEndPoint(`/api/elsa/contracts/${contractID}/customers`)
            .send()
            .map(res => res.json());
    }

    get(id: number): Observable<ElsaCustomer> {
        return this.uniHttp
            .asGET()
            .usingEmptyDomain()
            .withEndPoint(`/api/elsa/customers/${id}`)
            .send()
            .map(res => res.json());
    }

    getAll(): Observable<ElsaCustomer[]> {
        return this.uniHttp.asGET()
            .usingEmptyDomain()
            .withEndPoint('/api/elsa/customers')
            .send()
            .map(res => res.json());
    }

    public GetAll(): Observable<ElsaCustomer[]> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint('/api/customers')
            .send()
            .map(req => req.json());
    }
}
