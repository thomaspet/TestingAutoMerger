import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {ElsaCompanyLicense, ElsaContract, ElsaContractType} from '@app/models';


@Injectable()
export class ElsaContractService {
    constructor(private uniHttp: UniHttp) {}

    public get(id: number): Observable<ElsaContract> {
        return this.uniHttp
            .asGET()
            .usingEmptyDomain()
            .withEndPoint(`/api/elsa/contracts/${id}`)
            .send()
            .map(req => req.json());
    }

    public getAll(): Observable<ElsaContract[]> {
        return this.uniHttp
            .asGET()
            .usingEmptyDomain()
            .withEndPoint('/api/elsa/contracts')
            .send()
            .map(req => req.json());
    }

    public getCompanyLicenses(contractID: number): Observable<ElsaCompanyLicense[]> {
        return this.uniHttp
            .asGET()
            .usingEmptyDomain()
            .withEndPoint(`/api/elsa/contracts/${contractID}/companylicenses`)
            .send()
            .map(res => res.json());
    }

    activateContract(contractID: number, isBureau: boolean = false) {
        let endpoint = `/api/elsa/contracts/${contractID}?action=activate`;
        if (isBureau) {
            endpoint += `&ContractType=${ElsaContractType.Bureau}`;
        }

        return this.uniHttp
            .asPUT()
            .usingEmptyDomain()
            .withEndPoint(endpoint)
            .send();
    }
}
