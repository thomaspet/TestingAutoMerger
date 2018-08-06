import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {ElsaCustomer} from '@app/services/elsa/elsaModels';


@Injectable()
export class ElsaCustomersService {
    constructor(private uniHttp: UniHttp) {}

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
