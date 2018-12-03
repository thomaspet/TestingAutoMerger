import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {ElsaCompanyLicense, ElsaContract} from '@app/models';


@Injectable()
export class ElsaContractService {
    constructor(private uniHttp: UniHttp) {}

    public Get(id: number): Observable<ElsaContract> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint(`/api/contracts/${id}`)
            .send()
            .map(req => req.json());
    }

    public GetAll(): Observable<ElsaContract[]> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint('/api/contracts')
            .send()
            .map(req => req.json());
    }

    public GetCompanyLicenses(contractId: number): Observable<ElsaCompanyLicense[]> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint(`/api/contracts/${contractId}/companylicenses`)
            .send()
            .map(req => req.json());
    }
}
