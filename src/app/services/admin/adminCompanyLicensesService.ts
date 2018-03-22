import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';

export interface CompanyLicense {
    id: number;
    contractID: number;
    startDate: Date;
    endDate?: any;
    licenseKey: string;
    companyName: string;
    companyKey: string;
    statusCode: number;
    orgNumber?: any;
    customerID: number;
    customerName: string;
    contractType: number;
}

export interface UserLicensePurchase {
    id: number,
    productName: string,
    username: string,
    userLicenseID: number,
    purchaseForCompanyID: number,
    productID: number;
    contractID: number,
    isAssigned: boolean,
}

@Injectable()
export class AdminCompanyLicensesService {
    constructor(private uniHttp: UniHttp) {}

    public Get(id: number): Observable<CompanyLicense> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint(`/api/CompanyLicense/${id}`)
            .send()
            .map(req => req.json());
    }

    public GetAll(): Observable<CompanyLicense[]> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint('/api/CompanyLicense')
            .send()
            .map(req => req.json());
    }

    public PurchasesForUserLicense(companyKey: string): Observable<UserLicensePurchase[]> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint(`/api/CompanyLicenses/${companyKey}/purchasesForUserLicenseByCompanyKey`)
            .send()
            .map(req => req.json());
    }
}
