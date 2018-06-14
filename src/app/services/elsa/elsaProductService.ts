import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {ElsaPurchase} from '@app/services/elsa/elsaPurchasesService';

export interface ElsaProduct {
    id: number
    imageReference: string
    iconReference: string
    productKey: string
    name: string
    label: string
    description: string
    price: number
    isPerUser: boolean
    isPerTransaction: boolean
    isMonthly: boolean
    listOfRoles: string
    isBundle: boolean
    productStatus: ElsaProductStatusCode
    parentProductNames: string
    subProducts?: ElsaProduct[]
}


export enum ElsaProductStatusCode {
    Active = 0,
    Beta = 1,
    Deprecated = 2,
    Discontinued = 3
}

@Injectable()
export class ElsaProductService {
    constructor(private uniHttp: UniHttp) {}

    public Get(id: number): Observable<ElsaProduct> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint(`/api/products/${id}`)
            .send()
            .map(req => req.json());
    }

    public GetAll(): Observable<ElsaProduct[]> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint('/api/products')
            .send()
            .map(req => req.json())
            .map(this.convertSubProductsToArray);
    }

    public FindProductByName(name: string): Observable<ElsaProduct> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint('/api/products')
            .send()
            .map(res => res && res.json())
            .map(products => {
                return products.find(product => product.name === name);
            });
    }

    private convertSubProductsToArray(products: ElsaProduct[]): ElsaProduct[] {
        const mainProducts = products.filter(product => !product.parentProductNames);
        let subProducts = products.filter(product => !!product.parentProductNames);
        mainProducts.map(mainProduct => {
            const subProductsForMainProduct = subProducts
                .filter(subProduct => subProduct
                    .parentProductNames
                    .split(',')
                    .some(name => name === mainProduct.name));
            mainProduct.subProducts = subProductsForMainProduct || [];
        });
        return mainProducts;
    }

    public maxChar(products: ElsaProduct[], maxLength: number): ElsaProduct[] {
        for (let product of products) {
            if (product.description && product.description.length > maxLength) {
                product.description = product.description.substr(0, maxLength - 3) + '...';
            }
        }
        return products;
    }

    public PurchaseProductOnCurrentCompany(product: ElsaProduct): Observable<ElsaPurchase> {
        return this.uniHttp
            .asPOST()
            .usingElsaDomain()
            .withEndPoint(`/api/products/${product.id}/purchase`)
            .send()
            .map(req => req.json());
    }
}
