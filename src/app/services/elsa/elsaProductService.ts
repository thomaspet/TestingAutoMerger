import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';

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
    subProducts: ElsaProduct[]
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
            .send();
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
            .map(req => req.json())
            .map(products => {
                return products.filter(product => product.name === name)[0];
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

    public PurchaseProduct(product: ElsaProduct): Observable<boolean> {
        return this.uniHttp
            .asPOST()
            .usingElsaDomain()
            .withEndPoint(`/api/products/${product.id}/purchase`)
            .send()
            .map(() => true)
            .catch(() => Observable.of(false));
    }

    public UnpurchaseProduct(product: ElsaProduct): Observable<boolean> {
        return this.uniHttp
            .asDELETE()
            .usingElsaDomain()
            .withEndPoint(`/api/purchases/${product.id}`)
            .send()
            .map(() => true)
            .catch(() => Observable.of(false));
    }
}
