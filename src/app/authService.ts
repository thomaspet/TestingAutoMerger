import {Injectable, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {Http, Headers} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {AppConfig} from './AppConfig';
import {Company, User} from './unientities';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/map';

import {PUBLIC_ROUTES} from './routes';

import * as $ from 'jquery';
import * as jwt_decode from 'jwt-decode';

export interface IAuthDetails {
    token: string;
    activeCompany: any;
    user: User;
}

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

    constructor(private router: Router, private http: Http) {
        this.activeCompany = JSON.parse(localStorage.getItem('activeCompany'));

        this.jwt = localStorage.getItem('jwt');
        this.jwtDecoded = this.decodeToken(this.jwt);
        this.filesToken = localStorage.getItem('filesToken');

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
        let url = AppConfig.BASE_URL_INIT + AppConfig.API_DOMAINS.INIT + 'sign-in';

        return this.http.post(url, JSON.stringify(credentials), {headers: this.headers})
            .finally(() => {
                if (this.jwt) {
                    this.authenticateUniFiles();
                }
            })
            .switchMap((apiAuth) => {
                if (apiAuth.status !== 200) {
                    return Observable.of(apiAuth.json());
                }

                this.jwt = apiAuth.json().access_token;
                this.jwtDecoded = this.decodeToken(this.jwt);

                if (!this.jwtDecoded) {
                    return Observable.throw('Something went wrong when decoding token. Please re-authenticate.');
                }

                localStorage.setItem('jwt', this.jwt);
                return Observable.of(true);
            });
    }

    public authenticateUniFiles(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (!this.jwt) {
                reject('No jwt set');
            }

            const uniFilesUrl = AppConfig.BASE_URL_FILES + '/api/init/sign-in';
            this.http.post(uniFilesUrl, JSON.stringify(this.jwt), {headers: this.headers}).subscribe(
                res => {
                    if (res && res.status === 200) {
                        this.filesToken = res.json();
                        localStorage.setItem('filesToken', this.filesToken);

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
    public setActiveCompany(activeCompany, redirectUrl?: string): Subject<IAuthDetails> {
        localStorage.setItem('activeCompany', JSON.stringify(activeCompany));
        localStorage.setItem('lastActiveCompanyKey', activeCompany.Key);

        this.activeCompany = activeCompany;
        this.companyChange.emit(activeCompany);
        this.setLoadIndicatorVisibility(true);

        // Return a subject so other components can subscribe to know when everything is ready.
        // Subject instead of just returning the Observable from user GET because observables
        // are cold, and would require a subscribe to run.
        // By returning a subject instead we have the option to not subscribe,
        // without screwing up something in the authentication flow
        let authSubject = new Subject<IAuthDetails>();

        this.verifyAuthentication().subscribe(authDetails => {
            this.authentication$.next(authDetails);
            this.router.navigateByUrl(redirectUrl || '').then(() => {
                // TODO: Navigation removes spinner..
                // REVISIT: Does it make a difference if we do this after or just before?
                this.setLoadIndicatorVisibility(false);
                authSubject.next(authDetails);
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

        const url = AppConfig.BASE_URL
            + AppConfig.API_DOMAINS.BUSINESS
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
        let hasToken: boolean = !!this.jwt;
        let isTokenDecoded: boolean = !!this.jwtDecoded;
        let isExpired: boolean = this.isTokenExpired(this.jwtDecoded);

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

            let url = AppConfig.BASE_URL_INIT + AppConfig.API_DOMAINS.INIT + 'log-out';
            let headers = new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.jwt,
                'CompanyKey': this.activeCompany
            });

            this.http.post(url, '', {headers: headers}).subscribe();
        }

        localStorage.removeItem('jwt');
        localStorage.removeItem('activeCompany');
        localStorage.removeItem('activeFinancialYear');
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

        let expires = new Date(0);
        expires.setUTCSeconds(this.jwtDecoded.exp);
        return (expires.valueOf() < new Date().valueOf() + (offsetMinutes * 60000));
    }

    public canActivateRoute(user: User, url: string): boolean {
        // First check if the route is a public route
        const rootRoute = this.getRootRoute(url);
        if (!rootRoute || PUBLIC_ROUTES.some(route => route === rootRoute)) {
            return true;
        }

        if (!user) {
            return false;
        }

        // Treat empty permissions array as access to everything for now
        if (!user['Permissions'] || !user['Permissions'].length) {
            return true;
        }

        let permissionKey: string = this.getPermissionKey(url);

        // Check for direct match
        let hasPermission = user['Permissions'].some(permission => permission === permissionKey);

        // If no direct match: pop route parts one by one and check for
        // permission to everything under that.
        // E.g no permission for 'ui_salary_employees_employments
        // but permission for 'ui_salary_employees' and therefore employments
        if (!hasPermission) {
            let permissionParts = permissionKey.split('_');
            while (permissionParts.length) {
                permissionParts.pop();
                if (user['Permissions'].some(p => p === permissionParts.join('_'))) {
                    hasPermission = true;
                    break;
                }
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
            return part !== '' && isNaN(parseInt(part));
        });

        return 'ui_' + urlParts.join('_');
    }
}
