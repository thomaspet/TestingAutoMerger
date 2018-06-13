import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {
    ElsaPurchasesForUserLicenseByCompany,
    ElsaPurchaseForUserLicense
} from '@app/services/elsa/elsaPurchasesService';

export interface ElsaPurchaseForLicense {
    id: number;
    contractID: number;
    startDate: Date;
    endDate?: Date;
    licenseKey: string;
    companyName: string;
    companyKey: string;
    statusCode: number;
    orgNumber?: string;
    customerID: number;
    customerName: string;
    contractType: number;
}

export interface ElsaUserLicense {
    id: number;
    companyLicense?: any;
    companyLicenseID: number;
    startDate: Date;
    endDate?: Date;
    userLicenseKey: string;
    userName: string;
    userIdentity: string;
    statusCode: number;
    userLicenseType: number;
    purchases?: any;
    agreementAcceptances?: any;
}

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
            .withEndPoint(`/api/CompanyLicenses/${companyKey}/purchasesForUserLicenseByCompanyKey`)
            .send()
            .map(req => req.json());
    }
}
