import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {
    ElsaPurchaseForLicense,
    ElsaUserLicense,
    ElsaPurchasesForUserLicenseByCompany
} from '@app/services/elsa/elsaModels';

@Injectable()
export class ElsaCompanyLicenseService {
    constructor(private uniHttp: UniHttp) {}

    public Get(id: number): Observable<ElsaPurchaseForLicense> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint(`/api/CompanyLicenses/${id}`)
            .send()
            .map(req => req.json());
    }

    public GetAll(): Observable<ElsaPurchaseForLicense[]> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint('/api/CompanyLicenses/all')
            .send()
            .map(req => req.json());
    }

    public GetByCompanyKey(key: string): Observable<ElsaPurchaseForLicense> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint(`/api/CompanyLicenses/byCompanyKey/${key}`)
            .send()
            .map(req => req.json());
    }


    public GetUserLicenses(companyLicenseId: number): Observable<ElsaUserLicense[]> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint(`/api/CompanyLicenses/${companyLicenseId}/UserLicenses`)
            .send()
            .map(req => req.json());
    }

    public PurchasesForUserLicense(companyKey: string): Observable<ElsaPurchasesForUserLicenseByCompany[]> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint(`/api/CompanyLicenses/${companyKey}/purchasesForUserLicense`)
            .send()
            .map(req => req.json());
    }

    public GetAllUsers(companyLicenseId: string): Observable<ElsaUserLicense[]> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint(`/api/CompanyLicenses/byCompanyKey/${companyLicenseId}/Userlicenses`)
            .send()
            .map(req => req.json());
    }
}
