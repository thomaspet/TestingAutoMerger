import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '@app/authService';
import {FinancialYearService} from '@app/services/services';
import {environment} from 'src/environments/environment';
import {publishReplay, refCount, take} from 'rxjs/operators';
import {WidgetDefinition} from './models';
import {FeaturePermissionService} from '@app/featurePermissionService';
import {theme} from 'src/themes/theme';

@Injectable()
export class DashboardDataService {
    private cache: {[hash: number]: Observable<any>} = {};

    constructor(
        private http: HttpClient,
        private financialYearService: FinancialYearService,
        private authService: AuthService,
        private permissionService: FeaturePermissionService,
    ) {
        this.authService.authentication$.subscribe(() => this.invalidateCache());
    }

    get(endpoint: string, ignoreCache?: boolean) {
        const url = this.getRequestUrl(endpoint);
        const hash = this.hashFnv32a(endpoint);

        if (!this.cache[hash] || ignoreCache) {
            this.cache[hash] = this.http.get(url).pipe(
                publishReplay(),
                refCount()
            );
        }

        return this.cache[hash].pipe(take(1));
    }

    invalidateCache() {
        this.cache = {};
    }

    private getRequestUrl(endpoint: string) {
        if (endpoint.includes('<userID>')) {
            endpoint = endpoint.replace('<userID>', <any> this.authService.currentUser.ID);
        }

        if (endpoint.includes('<year>')) {
            const year = this.financialYearService.getActiveYear();
            endpoint = endpoint.replace('<year>', year.toString());
        }

        return environment.BASE_URL + endpoint;
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

    canShowWidget(widget: WidgetDefinition) {
        if (widget.onlyForTheme && theme.theme !== widget.onlyForTheme) {
            return false;
        }

        const user = this.authService.currentUser;
        const routePermissions = widget.routePermissions || [];
        const uiPermissions = widget.uiFeaturePermissions || [];

        const missingRoutePermission = routePermissions.some(p => {
            return !this.authService.hasUIPermission(user, p)
                || !this.permissionService.canShowRoute(p);
        });

        const missingUiFeaturePermission = uiPermissions.some(p => {
            return !this.permissionService.canShowUiFeature(p);
        });

        return !missingRoutePermission && !missingUiFeaturePermission;
    }
}

