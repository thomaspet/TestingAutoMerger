import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {
    ElsaPurchase,
    ElsaPurchaseForUserLicense,
    ElsaPurchaseForCompany,
} from '@app/services/elsa/elsaModels';


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
