import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {ElsaProduct, ElsaPurchase} from '@app/services/elsa/elsaModels';


@Injectable()
export class ElsaBundleService {
    constructor(private uniHttp: UniHttp) {}

    public Get(id: number): Observable<ElsaProduct> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint(`/api/bundles/${id}`)
            .send()
            .map(req => req.json());
    }

    public GetAll(): Observable<ElsaProduct[]> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint('/api/bundles')
            .send()
            .map(req => req.json());
    }
}
