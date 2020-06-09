import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable, of} from 'rxjs';
import {ElsaCompanyLicense, ElsaContract, ContractType, ElsaUserLicense, ElsaContractType, ElsaCategory} from '@app/models';
import {environment} from 'src/environments/environment';
import {HttpClient} from '@angular/common/http';
import {map, catchError} from 'rxjs/operators';
import {theme, THEMES} from 'src/themes/theme';
import {AuthService} from '@app/authService';
import {User} from '@uni-entities';

@Injectable()
export class ElsaContractService {
    ELSA_SERVER_URL = environment.ELSA_SERVER_URL;

    constructor(
        private authService: AuthService,
        private uniHttp: UniHttp,
        private http: HttpClient
    ) {}

    get(id: number, select?: string): Observable<ElsaContract> {
        const selectClause = select ? `$select=${select}&` : '';
        return this.http.get<ElsaContract[]>(this.ELSA_SERVER_URL + `/api/contracts?${selectClause}$filter=id eq ${id}`)
            .pipe(map(res => res[0]));
    }

    getAll(): Observable<ElsaContract[]> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint('/api/contracts')
            .send()
            .map(req => req.body);
    }

    getContractTypes(): Observable<ElsaContractType[]> {
        return this.http.get<ElsaContractType[]>('/api/elsa/contract-types').pipe(
            catchError(err => {
                console.error(err);
                return of([]);
            })
        );
    }

    getCustomContractTypes(): Observable<ElsaContractType[]> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint('/api/contracttypes?$expand=bulletpoints,productcontracttypes($expand=product)')
            .send()
            .map(res => {
                return (res.body || []).filter(contractType => {
                    return contractType.IsActive
                        && contractType.IsPublic
                        && contractType.ContractType > 20;
                });
            });
    }

    // used for comparing contract-types
    getContractTypesCategories(): Observable<ElsaCategory[]> {
        return this.http.get<ElsaCategory[]>(this.ELSA_SERVER_URL + '/api/categories');
    }

    getValidContractTypeUpgrades(): Observable<number[]> {
        const url = `/api/elsa/contracts/${this.authService.contractID}/check-upgrade?valid=true`;
        return this.http.get<any[]>(url).pipe(
            catchError(err => {
                console.error(err);
                return of([]);
            }),
            map(res => (res || []).map(item => item.TargetType))
        );
    }

    changeContractType(contractType: number) {
        const url = `/api/elsa/contracts/${this.authService.contractID}/upgrade?contractType=${contractType}`;
        return this.http.put(url, null);
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

    activate(contractID: number, body, contractType?: number) {
        let endpoint = `/api/elsa/contracts/${contractID}/activate`;

        const queryParams = [];
        if (contractType) {
            queryParams.push(`contractType=${contractType}`);
        }

        if (theme.theme === THEMES.SR) {
            queryParams.push(`companyStatusCode=3`); // pending
        }

        if (queryParams.length) {
            endpoint += `?${queryParams.join('&')}`;
        }

        return this.uniHttp
            .asPUT()
            .usingEmptyDomain()
            .withEndPoint(endpoint)
            .withBody(body)
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
            case ContractType.Standard:
                return 'Standard';
            case ContractType.Bureau:
                return 'Byrå';
            case ContractType.Demo:
                return 'Demo';
            case ContractType.Internal:
                return 'Intern';
            case ContractType.Partner:
                return 'Partner';
            case ContractType.Pilot:
                return 'Pilot';
            case ContractType.NonProfit:
                return 'Non-profit';
            default:
                return '';
        }
    }
}
