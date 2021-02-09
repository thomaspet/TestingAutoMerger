import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable, of} from 'rxjs';
import {
    ElsaCompanyLicense,
    ElsaContract,
    ContractType,
    ElsaUserLicense,
    ElsaContractType,
    ElsaCategory,
    BillingData,
    ElsaSupportUserDTO
} from '@app/models';
import {environment} from 'src/environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
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

    get(id: number, select?: string, expand?: string): Observable<ElsaContract> {
        const selectClause = select ? `$select=${select}&` : '';
        const expandClause = expand ? `$expand=${expand}&` : '';
        return this.http.get<ElsaContract[]>(this.ELSA_SERVER_URL + `/api/contracts?${selectClause}${expandClause}$filter=id eq ${id}`)
            .pipe(map(res => res[0]));
    }

    getAll(ignoreLicenseAdmin = false): Observable<ElsaContract[]> {
        const ignore = ignoreLicenseAdmin ? 'ignoreLicenseAdmin=true&' : '';
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint('/api/contracts?' + ignore + '$expand=AgreementAcceptances,Customer')
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

    getCurrentContractType(contracttype: string): Observable<ElsaContractType> {
        return this.http.get<ElsaContractType[]>(this.ELSA_SERVER_URL + `/api/contracttypes?$filter=contracttype eq '${contracttype}'`)
            .pipe(
                catchError(err => {
                    console.error(err);
                    return of([]);
                }),
                map((types: ElsaContractType[]) => types[0]));
    }

    getCustomContractTypes(): Observable<ElsaContractType[]> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint(`/api/contracttypes?$expand=bulletpoints,productcontracttypes($expand=product;$filter=product/producttype eq 'Package')`)
            .send()
            .pipe(
                map(res => (res.body || []).filter(type => type.ContractType > 0 && type.IsActive && type.IsPublic))
            );
    }

    getContractTypesLabel(contracttype: string): Observable<string> {
        return this.http.get<ElsaContractType[]>(this.ELSA_SERVER_URL + `/api/contracttypes?$filter=contracttype eq '${contracttype}'&$select=label`)
            .pipe(
                catchError(err => {
                    console.error(err);
                    return of([]);
                }),
                map((types: ElsaContractType[]) => types && types[0]?.Label));
    }

    // used for comparing contract-types
    getContractTypesCategories(): Observable<ElsaCategory[]> {
        return this.http.get<ElsaCategory[]>(this.ELSA_SERVER_URL + '/api/categories');
    }

    getValidContractTypeUpgrades(): Observable<any[]> {
        const url = `/api/elsa/contracts/${this.authService.contractID}/check-upgrade`;
        return this.http.get<any[]>(url).pipe(
            catchError(err => {
                console.error(err);
                return of([]);
            }),
            map(res => (res || []))
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

    deactivateUserLicenseOnContract(contractID: number, userIdentity: string) {
        // specify json content type, otherwise the put thinks it's text/plain
        const headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
        return this.http.put(`/api/elsa/contracts/${contractID}/deactivate-user`, `\"${userIdentity}\"`, {headers: headers});
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

    getSupportUsers(): Observable<ElsaSupportUserDTO[]> {
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

    updateTwoFactorAuthentication(contractID: number, body): Observable<ElsaContract> {
        return this.http.put(this.ELSA_SERVER_URL + `/api/contracts/${contractID}`, body).pipe(map(res => res[0]));
    }

    getBillingEstimate(contractID: number, year: number, month: number): Observable<BillingData> {
        const endpoint = `/api/billing/contract/${contractID}`
            + `?year=${year}`
            + `&month=${month}`
            + `&tags=true`;
        return this.http.get<BillingData>(this.ELSA_SERVER_URL + endpoint);
    }


    getBillingHistory(contractID: number): Observable<BillingData[]> {
        return this.http.get<BillingData[]>(this.ELSA_SERVER_URL + `/api/billing/contract/${contractID}/history/data`);
    }
}
