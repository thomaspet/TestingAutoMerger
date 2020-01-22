import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {AuthService} from '../../authService';
import {FinancialYearService} from '../../services/services';
import {Observable} from 'rxjs';

@Injectable()
export class WidgetDataService {
    private requestCache: {[hash: number]: Observable<any>} = {};

    constructor(
        private http: UniHttp,
        private authService: AuthService,
        private financialYearService: FinancialYearService
    ) {
        this.authService.authentication$.subscribe(authChange => {
            this.requestCache = {};
        });
    }

    public getData(endpoint: string) {
        // Should probably move these to separate functions if more replaces are needed
        if (endpoint.includes('<userID>')) {
            endpoint = this.replaceWithUserID(endpoint);
        }

        if (endpoint.includes('<year>')) {
            const year = this.financialYearService.getActiveYear();
            return this.request(endpoint.replace('<year>', year.toString()));
        }

        return this.request(endpoint);
    }

    public hasAccess(permission: string) {
        return this.authService.hasUIPermission(this.authService.currentUser, permission);
    }

    public replaceWithUserID(string) {
        return string.replace('<userID>', <any> this.authService.currentUser.ID);
    }

    public clearCache() {
        this.requestCache = {};
    }

    public request(endpoint) {
        const hash = this.hashFnv32a(endpoint);

        if (!this.requestCache[hash]) {
            this.requestCache[hash] = this.http
                .asGET()
                .usingEmptyDomain()
                .withEndPoint(endpoint)
                .send()
                .map(res => res.body)
                .publishReplay(1)
                .refCount();
        }

        return this.requestCache[hash];
    }

    /**
     * Calculate a 32 bit FNV-1a hash
     * Used for converting endpoint + odata string to a smaller hash
     * that is used as key for the result cache.
     * Ref: https://gist.github.com/vaiorabbit/5657561
     *      http://isthe.com/chongo/tech/comp/fnv/
     */
    protected hashFnv32a(input: string): number {
        /* tslint:disable:no-bitwise */
        let i, l,
            hval = 0x811c9dc5;

        for (i = 0, l = input.length; i < l; i++) {
            hval ^= input.charCodeAt(i);
            hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
        }

        return hval >>> 0;
    }

    public addCustomLiquidityPayment(body) {
        const query = body.ID
        ? this.http.asPUT().withEndPoint(`/liquiditypayment/${body.ID}`)
        : this.http.asPOST().withEndPoint('/liquiditypayment');

        return query.usingBusinessDomain()
            .withBody(body)
            .send()
            .map(res => res.body);
    }

    public getCustomLiquidityPayments() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('/liquiditypayment')
            .send()
            .map(res => res.body);
    }

    public deleteCustomLiquidityPayment(id: number) {
        return this.http
            .asDELETE()
            .usingBusinessDomain()
            .withEndPoint(`/liquiditypayment/${id}`)
            .send()
            .map(res => res.body);
    }
}
