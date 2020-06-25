import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UniHttp} from '@uni-framework/core/http/http';
import {Observable} from 'rxjs';
import {ElsaProduct} from '@app/models';
import {map, take} from 'rxjs/operators';
import {environment} from 'src/environments/environment';
import {AuthService} from '@app/authService';

@Injectable()
export class ElsaProductService {
    private cache: {[endpoint: string]: Observable<any>} = {};
    ELSA_SERVER_URL = environment.ELSA_SERVER_URL;

    constructor(
        private authService: AuthService,
        private uniHttp: UniHttp,
        private http: HttpClient
    ) {
        this.authService.authentication$.subscribe(() => this.cache = {});
    }

    public invalidateCache() {
        this.cache = {};
    }

    private requestData(endpoint: string) {
        let request = this.cache[endpoint];
        if (!request) {
            request = this.uniHttp
                .asGET()
                .usingElsaDomain()
                .withEndPoint(endpoint)
                .send()
                .pipe(map(res => res.body))
                .publishReplay(1)
                .refCount();

            this.cache[endpoint] = request;
        }

        return request.pipe(take(1));
    }

    public Get(id: number): Observable<ElsaProduct> {
        return this.requestData(`/api/products/${id}`);
    }

    public GetAll(filter?: string): Observable<ElsaProduct[]> {
        const url = '/api/products' + (filter ? ('?$filter=' + filter) : '');
        return this.requestData(url);
    }

    public FindProductByName(name: string): Observable<ElsaProduct> {
        return this.requestData('/api/products').map(products => {
            return products.find(product => product.name === name);
        });
    }

    getProductsOnContractType() {
        const typeID = this.uniHttp.authService.currentUser.License?.ContractType?.TypeID;
        const url = '/api/contracttypes?$expand=productcontracttypes($expand=product)';

        if (!this.cache[url]) {
            this.cache[url] = this.uniHttp
                .asGET()
                .usingElsaDomain()
                .withEndPoint(url)
                .send()
                .pipe(map(res => {
                    const contractTypes = res && res.body;
                    const contractType = (contractTypes || []).find(type => type.ContractType === typeID);
                    if (contractType) {
                        return (contractType.ProductContractTypes || []).map(x => x.Product);
                    }

                    return [];
                }))
                .publishReplay(1)
                .refCount();
        }

        return this.cache[url].pipe(take(1));
    }

    // this does almost the same as the method above, and might replace it
    getProductsOnContractTypes(id: number, filter?: string): Observable<ElsaProduct[]> {
        const filterClause = filter ? `?$filter=${filter}` : '';
        const endpoint = `/api/contracttypes/${id}/products` + filterClause;
        return this.http.get<ElsaProduct[]>(this.ELSA_SERVER_URL + endpoint);
    }

    public ProductTypeToPriceText(product: ElsaProduct): string {
        const text = [];
        if (product.IsPerUser) {
            text.push('per bruker');
        }
        if (product.IsMonthly) {
            text.push('per måned');
        }
        if (product.IsPerTransaction) {
            text.push('per transaksjon');
        }
        return text.join(' ');
    }
}
