﻿import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {AuthService} from '../../authService';
import {YearService} from '../../services/services';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class WidgetDataService {
    private requestCache: {[hash: number]: Observable<any>} = {};

    constructor(
        private http: UniHttp,
        private authService: AuthService,
        private yearService: YearService
    ) {
        this.authService.authentication$.subscribe(authChange => {
            this.requestCache = {};
        });

        this.yearService.selectedYear$.subscribe()
    }

    public getData(endpoint: string) {
        // Should probably move these to separate functions if more replaces are needed
        if (endpoint.includes('<userID>')) {
            endpoint = endpoint.replace('<userID>', this.authService.getTokenDecoded().nameid);
        }

        if (endpoint.includes('<year>')) {
            return this.yearService.getActiveYear()
                .switchMap((year) => {
                    return this.request(endpoint.replace('<year>', year.toString()));
                });
        }

        return this.request(endpoint);
    }

    public request(endpoint) {
        const hash = this.hashFnv32a(endpoint);

        if (!this.requestCache[hash]) {
            this.requestCache[hash] = this.http
                .asGET()
                .usingEmptyDomain()
                .withEndPoint(endpoint)
                .send()
                .map(res => res.json())
                .share();
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
}
