import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';

export interface AdminProduct {
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
    productStatus: ProductStatusCode
    parentProductNames: string
    subProducts: AdminProduct[]
}

export enum ProductStatusCode {
    Active = 0,
    Beta = 1,
    Deprecated = 2,
    Discontinued = 3
}

@Injectable()
export class AdminProductService {
    constructor(private uniHttp: UniHttp) {}

    public Get(id: number): Observable<AdminProduct> {
        return this.uniHttp
            .asGET()
            .usingAdminDomain()
            .withEndPoint(`/api/products/${id}`)
            .send();
    }

    public GetAll(): Observable<AdminProduct[]> {
        return this.uniHttp
            .asGET()
            .usingAdminDomain()
            .withEndPoint('/api/products')
            .send()
            .map(req => req.json())
            .map(this.convertSubProductsToArray);
    }

    public FindProductByName(name: string): Observable<AdminProduct> {
        return this.uniHttp
            .asGET()
            .usingAdminDomain()
            .withEndPoint('/api/products')
            .send()
            .map(req => req.json())
            .map(products => {
                return products.filter(product => product.name === name)[0];
            });
    }

    private convertSubProductsToArray(products: AdminProduct[]): AdminProduct[] {
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

    public maxChar(products: AdminProduct[], maxLength: number): AdminProduct[] {
        for (let product of products) {
            if (product.description && product.description.length > maxLength) {
                product.description = product.description.substr(0, maxLength - 3) + '...';
            }
        }
        return products;
    }

    public PurchaseProduct(product: AdminProduct): Observable<boolean> {
        return this.uniHttp
            .asPOST()
            .usingAdminDomain()
            .withEndPoint(`/api/products/${product.id}/purchase`)
            .send()
            .map(() => true)
            .catch(() => Observable.of(false));
    }
}
