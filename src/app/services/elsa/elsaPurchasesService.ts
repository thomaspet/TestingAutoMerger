import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {ElsaProduct} from '@app/services/elsa/elsaProductService';
import {ElsaPurchaseForLicense} from '@app/services/elsa/elsaCompanyLicenseService';
import {UserLicense} from '@app/unientities';

export interface ElsaPurchase {
    id: number;
    contract?: ElsaContract;
    contractID: number;
    startDate: string;
    endDate?: null;
    userLimit: number;
    key: string;
    product?: ElsaProduct;
    productID: number;
    companyPurchases?: ElsaPurchaseForCompany[];
}

export interface ElsaContract {
    id: number;
    customer?: any;
    customerID: number;
    contractType: number;
    statusCode: number;
    startDate: Date;
    endDate?: any;
    settledUntil?: any;
    note?: any;
    limit: number;
    key: string;
    purchases: ElsaPurchase[];
    companyLicenses?: ElsaPurchaseForLicense[];
}

// This is called "PurchasesForUserLicenseByCompany" in the elsa backend
export interface ElsaPurchasesForUserLicenseByCompany {
    productName: string;
    productID: number;
    username: string;
    userIdentity: string;
    userLicenseID: number;
    purchaseForCompanyID: number;
    contractID: number;
    isAssigned: boolean;
}

export interface ElsaPurchaseForCompany {
    id: number;
    purchaseID: number;
    purchase?: ElsaPurchase;
    startDate: Date;
    endDate?: Date;
    companyLicenseID: number;
    companyLicense?: ElsaPurchaseForLicense;
    userPurchases?: ElsaPurchasesForUserLicenseByCompany[];
}

export interface ElsaPurchaseForUserLicense {
    id: number;
    purchaseForCompanyID: number;
    companyPurchase?: ElsaPurchaseForCompany;
    userLicenseID: number;
    userLicense?: UserLicense;
    startDate: Date;
    endDate?: Date;
}


@Injectable()
export class ElsaPurchaseService {
    constructor(private uniHttp: UniHttp) {}

    public Get(id: number): Observable<ElsaPurchase> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint(`/api/purchases/${id}`)
            .send()
            .map(response => response.json());
    }

    public GetAll(): Observable<ElsaPurchase[]> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint('/api/purchases')
            .send()
            .map(response => response.json());
    }

    public PurchaseProductForContract(productId: number, contractId: number): Observable<ElsaPurchase> {
        return this.uniHttp
            .asPOST()
            .withBody({
                "contractID": contractId,
                "productID": productId,
            })
            .usingElsaDomain()
            .withEndPoint(`/api/purchases`)
            .send()
            .map(req => req.json());
    }

    public PurchaseProductForCompany(purchaseID:number, companyLicenseID: number): Observable<ElsaPurchaseForCompany> {
            return this.uniHttp
                .asPOST()
                .withBody({
                    purchaseID: purchaseID,
                    companyLicenseID: companyLicenseID,
                })
                .usingElsaDomain()
                .withEndPoint(`/api/PurchaseForCompanies`)
                .send()
                .map(response => response.json());
    }

    public PurchaseProductForUser(companyID: number, userLicenseID: number): Observable<ElsaPurchaseForUserLicense> {
        return this.uniHttp
            .asPOST()
            .withBody({
                PurchaseForCompanyID: companyID,
                UserLicenseID: userLicenseID,
            })
            .usingElsaDomain()
            .withEndPoint('/api/PurchaseForUserLicenses')
            .send()
            .map(response => response.json());
    }

    public RemoveProductForUser(companyID: number, userLicenseID: number): Observable<ElsaPurchaseForUserLicense> {
        return this.uniHttp
            .asDELETE()
            .withBody({
                PurchaseForCompanyID: companyID,
                UserLicenseID: userLicenseID,
            })
            .usingElsaDomain()
            .withEndPoint('/api/PurchaseForUserLicenses')
            .send()
            .map(response => response.json());
    }
}
