import {Injectable, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {Http, Headers} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {environment} from 'src/environments/environment';
import {Company, UserDto} from './unientities';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/map';

import * as $ from 'jquery';
import * as jwt_decode from 'jwt-decode';

export interface IAuthDetails {
    token: string;
    activeCompany: any;
    user: UserDto;
}

const PUBLIC_ROOT_ROUTES = [
    'init',
    'bureau',
    'about',
    'assignments',
    'tickers',
    'uniqueries',
    'sharings',
    'marketplace'
];

const PUBLIC_ROUTES = [
    '/sales/productgroups/groupDetails'
];

@Injectable()
export class AuthService {
    public requestAuthentication$: EventEmitter<any> = new EventEmitter();
    public companyChange: EventEmitter<Company> = new EventEmitter();

    public authentication$: ReplaySubject<IAuthDetails> = new ReplaySubject<IAuthDetails>(1);
    public filesToken$: ReplaySubject<string> = new ReplaySubject(1);
    public jwt: string;
    public jwtDecoded: any;
    public activeCompany: any;
    public companySettings: any;
    public filesToken: string;

    private headers: Headers = new Headers({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    });


    // Re-implementing a subset of BrowserStorageService here to prevent circular dependencies
    private storage = {
        saveOnUser: (key, value) => {
            if (value === undefined) {
                throw new Error('Tried to marshal undefined into a JSON string, failing to prevent corrupt localStorage');
            }
            localStorage.setItem(key, JSON.stringify(value));
        },
        getOnUser: key => {
            try {
                return JSON.parse(localStorage.getItem(key));
            } catch (e) {
                localStorage.removeItem(key);
                return null;
            }
        },
        removeOnUser: key => localStorage.removeItem(key),
    };

    constructor(
        private router: Router,
        private http: Http,
    ) {
        this.activeCompany = this.storage.getOnUser('activeCompany');

        this.jwt = this.storage.getOnUser('jwt');
        this.jwtDecoded = this.decodeToken(this.jwt);
        this.filesToken = this.storage.getOnUser('filesToken');

        if (this.jwt && this.activeCompany) {
            this.setLoadIndicatorVisibility(true);
            this.verifyAuthentication().subscribe(
                res => {
                    this.authentication$.next(res);
                    this.filesToken$.next(this.filesToken);
                    // Give the app a bit of time to initialise before we remove spinner
                    // (less visual noise on startup)
                    setTimeout(() => this.setLoadIndicatorVisibility(false), 250);
                },
                err => {
                    this.setLoadIndicatorVisibility(false);
                    this.authentication$.next({
                        activeCompany: undefined,
                        token: undefined,
                        user: undefined
                    });
                }
            );
        } else {
            this.authentication$.next({
                activeCompany: undefined,
                token: undefined,
                user: undefined
            });
        }

        // Check expired status every minute, with a 10 minute offset on the expiration check
        // This allows the user to re-authenticate before http calls start 401'ing.
        // Also check if we have a files token, and re-authenticate with uni-files if not.
        setInterval(() => {
            if (this.jwt && this.isTokenExpired(10)) {
                this.requestAuthentication$.emit(true);
            }

            if (this.jwt && !this.filesToken) {
                this.authenticateUniFiles();
            }
        }, 60000);
    }

    private setLoadIndicatorVisibility(visible: boolean) {
        if (visible) {
            $('#data-loading-spinner').fadeIn(250);
        } else {
            $('#data-loading-spinner').fadeOut(250);
        }
    }

    /**
     * Authenticates the user and returns an observable of the response
     * @param {Object} credentials
     * @returns Observable
     */
    public authenticate(credentials: {username: string, password: string}): Observable<boolean> {
        const url = environment.BASE_URL_INIT + environment.API_DOMAINS.INIT + 'sign-in';

        return this.http.post(url, JSON.stringify(credentials), {headers: this.headers})
            .switchMap((apiAuth) => {
                if (apiAuth.status !== 200) {
                    return Observable.of(apiAuth.json());
                }

                this.jwt = apiAuth.json().access_token;
                this.jwtDecoded = this.decodeToken(this.jwt);

                if (!this.jwtDecoded) {
                    return Observable.throw('Something went wrong when decoding token. Please re-authenticate.');
                }

                this.authenticateUniFiles();

                this.storage.saveOnUser('jwt', this.jwt);
                return Observable.of(true);
            });
    }

    public authenticateUniFiles(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (!this.jwt) {
                reject('No jwt set');
            }

            const uniFilesUrl = environment.BASE_URL_FILES + '/api/init/sign-in';
            this.http.post(uniFilesUrl, JSON.stringify(this.jwt), {headers: this.headers}).subscribe(
                res => {
                    if (res && res.status === 200) {
                        this.filesToken = res.json();
                        this.storage.saveOnUser('filesToken', this.filesToken);

                        this.filesToken$.next(this.filesToken);
                        resolve(this.filesToken);
                    }
                },
                err => {
                    reject('Error authenticating');
                    console.log('Error authenticating:', err);
                }
            );
        });
    }

    /**
     * Sets the current active company
     * @param {Object} activeCompany
     */
    public setActiveCompany(activeCompany: Company, redirectUrl?: string): Subject<IAuthDetails> {
        this.storage.saveOnUser('activeCompany', activeCompany);
        this.storage.saveOnUser('lastActiveCompanyKey', activeCompany.Key);

        this.activeCompany = activeCompany;
        this.companyChange.emit(activeCompany);
        this.setLoadIndicatorVisibility(true);

        // Return a subject so other components can subscribe to know when everything is ready.
        // Subject instead of just returning the Observable from user GET because observables
        // are cold, and would require a subscribe to run.
        // By returning a subject instead we have the option to not subscribe,
        // without screwing up something in the authentication flow
        const authSubject = new Subject<IAuthDetails>();

        this.verifyAuthentication().take(1).subscribe(authDetails => {
            this.authentication$.next(authDetails);
            setTimeout(() => {
                this.router.navigateByUrl(redirectUrl || '').then((res) => {
                    // TODO: Navigation removes spinner..
                    // REVISIT: Does it make a difference if we do this after or just before?
                    this.setLoadIndicatorVisibility(false);
                    authSubject.next(authDetails);
                });

            });
        });

        return authSubject;
    }

    private verifyAuthentication(): Observable<IAuthDetails> {
        const headers = new Headers({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.jwt}`,
            'CompanyKey': this.activeCompany.Key
        });

        const url = environment.BASE_URL
            + environment.API_DOMAINS.BUSINESS
            + 'users?action=current-session';

        return this.http.get(url, {headers: headers}).map(res => {
            return {
                token: this.jwt,
                activeCompany: this.activeCompany,
                user: res.json()
            };
        });
    }

    /**
     * Returns web token or redirects to /login if user is not authenticated
     * @returns {String}
     */
    public getToken(): string {
        return this.jwt;
    }

    /**
     * Returns decoded web token for authenticated user
     * @returns {String}
     */
    public getTokenDecoded(): any {
        return this.jwtDecoded;
    }

    /**
     * Returns the current active companykey string
     */
    public getCompanyKey(): string {
        return this.activeCompany && this.activeCompany.Key;
    }

    /**
     * Returns a boolean indicating whether the user is authenticated or not
     * @returns {Boolean}
     */
    public isAuthenticated(): boolean {
        const hasToken: boolean = !!this.jwt;
        const isTokenDecoded: boolean = !!this.jwtDecoded;
        const isExpired: boolean = this.isTokenExpired(this.jwtDecoded);

        return hasToken && isTokenDecoded && !isExpired;
    }

    /**
     * Returns a boolean indicating whether the user has selected an active company
     * @returns {Boolean}
     */
    public hasActiveCompany(): boolean {
        return !!this.activeCompany;
    }

    /**
     * Removes web token from localStorage and memory, then redirects to /login
     */
    public clearAuthAndGotoLogin(): void  {
        if (this.isAuthenticated()) {
            this.authentication$.next({token: undefined, activeCompany: undefined, user: undefined});
            this.filesToken$.next(undefined);

            const url = environment.BASE_URL_INIT + environment.API_DOMAINS.INIT + 'log-out';
            const headers = new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.jwt,
                'CompanyKey': this.activeCompany
            });

            this.http.post(url, '', {headers: headers}).subscribe();
        }

        this.storage.removeOnUser('jwt');
        this.storage.removeOnUser('activeCompany');
        this.storage.removeOnUser('activeFinancialYear');
        this.jwt = undefined;
        this.jwtDecoded = undefined;
        this.activeCompany = undefined;
        this.router.navigateByUrl('init/login');
    }

    /**
     * Returns the decoded web token
     * @returns {Object}
     */
    private decodeToken(token: string) {
        try {
            if (!token) {
                return undefined;
            } else {
                return jwt_decode(token);
            }
        } catch (e) {}
    }

    /**
     * Returns a boolean indicating whether or not the token is expired.
     * If offSetMinutes is passed to the function it will check if token
     * will expire in the next n minutes
     * @param {Object} decodedToken
     * @param {Number} [offSetMinutes=0] offset
     * @returns {Boolean}
     */
    public isTokenExpired(offsetMinutes: number = 0): boolean {
        if (!this.jwtDecoded) {
            return true;
        }

        const expires = new Date(0);
        expires.setUTCSeconds(this.jwtDecoded.exp);
        return (expires.valueOf() < new Date().valueOf() + (offsetMinutes * 60000));
    }

    public canActivateRoute(user: UserDto, url: string): boolean {
        // First check if the route is a public route
        if (PUBLIC_ROUTES.some(route => route === url)) {
            return true;
        }

        const rootRoute = this.getRootRoute(url);
        if (!rootRoute || PUBLIC_ROOT_ROUTES.some(route => route === rootRoute)) {
            return true;
        }

        if (!user) {
            return false;
        }

        const permissionKey: string = this.getPermissionKey(url);
        return this.hasUIPermission(user, permissionKey);
    }

    public hasUIPermission(user: UserDto, permission: string) {
        // Treat missing or empty permissions array as access to everything
        const userPermissions = user['Permissions'] || [];
        if (!userPermissions.length) {
            return true;
        }

        permission = permission.trim();

        // Check for direct match
        let hasPermission = user['Permissions'].some(p => p === permission);

        // Pop permission parts and check for * access
        if (!hasPermission) {
            const permissionSplit = permission.split('_');

            while (permissionSplit.length && !hasPermission) {
                const multiPermision = permissionSplit.join('_') + '_*';
                if (user['Permissions'].some(p => p === multiPermision)) {
                    hasPermission = true;
                }

                permissionSplit.pop();
            }
        }

        return hasPermission;
    }

    private getRootRoute(url): string {
        let routeParts = url.split('/');
        routeParts = routeParts.filter(part => part !== '');

        return routeParts[0];
    }

    private getPermissionKey(url: string): string {
        if (!url) {
            return '';
        }

        // Remove query params first
        let noQueryParams = url.split('?')[0];
        noQueryParams = noQueryParams.split(';')[0];


        let urlParts = noQueryParams.split('/');
        urlParts = urlParts.filter(part => {
            // Remove empty url parts and numeric url parts (ID params)
            return part !== '' && isNaN(parseInt(part, 10));
        });

        return 'ui_' + urlParts.join('_');
    }
}
