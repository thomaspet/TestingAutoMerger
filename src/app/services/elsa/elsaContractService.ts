import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {ElsaCompanyLicense, ElsaContract, ElsaContractType, ElsaUserLicense} from '@app/models';

@Injectable()
export class ElsaContractService {
    constructor(private uniHttp: UniHttp) {}

    get(id: number): Observable<ElsaContract> {
        return this.uniHttp
            .asGET()
            .usingEmptyDomain()
            .withEndPoint(`/api/elsa/contracts/${id}`)
            .send()
            .map(req => req.body);
    }

    getAll(): Observable<ElsaContract[]> {
        return this.uniHttp
            .asGET()
            .usingEmptyDomain()
            .withEndPoint('/api/elsa/contracts')
            .send()
            .map(req => req.body);
    }

    getCompanyLicenses(contractID: number): Observable<ElsaCompanyLicense[]> {
        return this.uniHttp
            .asGET()
            .usingEmptyDomain()
            .withEndPoint(`/api/elsa/contracts/${contractID}/companylicenses?isDeleted=false`)
            .send()
            .map(res => res.body);
    }

    getDeletedCompanyLicenses(contractID: number): Observable<ElsaCompanyLicense[]> {
        return this.uniHttp
            .asGET()
            .usingEmptyDomain()
            .withEndPoint(`/api/elsa/contracts/${contractID}/companylicenses?isDeleted=true`)
            .send()
            .map(res => res.body);
    }

    getUserLicenses(contractID: number): Observable<ElsaUserLicense[]> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint(`/api/contracts/${contractID}/userlicense-summary`)
            .send()
            .map(res => {
                const users = res.body || [];
                return users.filter(user => user.UserName !== 'System User');
            });
    }

    activateContract(contractID: number, isBureau: boolean = false, statusCode: number = null) {
        let endpoint = `/api/elsa/contracts/${contractID}/activate`;
        if (isBureau) {
            endpoint += `&ContractType=${ElsaContractType.Bureau}`;
        }

        if (statusCode) {
            endpoint += '?companyStatusCode=' + statusCode;
        }

        return this.uniHttp
            .asPUT()
            .usingEmptyDomain()
            .withEndPoint(endpoint)
            .send();
    }

    getContractTypeText(contractType: number) {
        switch (contractType) {
            case ElsaContractType.Standard:
                return 'Standard';
            case ElsaContractType.Bureau:
                return 'Byrå';
            case ElsaContractType.Demo:
                return 'Demo';
            case ElsaContractType.Internal:
                return 'Intern';
            case ElsaContractType.Partner:
                return 'Partner';
            case ElsaContractType.Pilot:
                return 'Pilot';
            case ElsaContractType.NonProfit:
                return 'Non-profit';
            default:
                return '';
        }
    }
}
