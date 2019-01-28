import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {ElsaCustomer} from '@app/models';


@Injectable()
export class ElsaCustomersService {
    constructor(private uniHttp: UniHttp) {}

    getLicenseOwner() {
        return this.uniHttp
            .asGET()
            .usingEmptyDomain()
            .withEndPoint('/api/elsa/customers')
            .send()
            .map(req => req.json());
    }

    public Get(id: number): Observable<ElsaCustomer> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint(`/api/customers/${id}`)
            .send()
            .map(req => req.json());
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
