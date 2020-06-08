import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable, of} from 'rxjs';
import {ElsaCompanyLicense, ElsaContract, ElsaContractType, ElsaUserLicense} from '@app/models';
import {environment} from 'src/environments/environment';
import {HttpClient} from '@angular/common/http';
import {map, catchError} from 'rxjs/operators';
import {User} from '@uni-entities';

@Injectable()
export class ElsaContractService {
    ELSA_SERVER_URL = environment.ELSA_SERVER_URL;

    constructor(private uniHttp: UniHttp, private http: HttpClient) {}

    get(id: number, select?: string): Observable<ElsaContract> {
        const selectClause = select ? `$select=${select}&` : '';
        return this.http.get<ElsaContract[]>(this.ELSA_SERVER_URL + `/api/contracts?${selectClause}$filter=id eq ${id}`)
            .pipe(map(res => res[0]));
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

    getUserLicense(contractID: number, userIdentity: string): Observable<ElsaUserLicense> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint(`/api/contracts/${contractID}/userlicense-summary?$filter=useridentity eq ${userIdentity}`)
            .send()
            .map(res => res.body && res.body[0]);
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

    getSupportUsers(): Observable<User[]> {
        return this.uniHttp
            .asGET()
            .usingEmptyDomain()
            .withEndPoint('/api/elsa/support-users')
            .send()
            .pipe(
                map(res => res.body),
                catchError(() => of([]))
            );
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
