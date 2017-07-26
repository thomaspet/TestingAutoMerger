import {Injectable, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {Http, Headers} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {AppConfig} from '../../app/AppConfig';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/map';

// declare const jwt_decode: (token: string) => any; // node_module/jwt_decode
import * as jwt_decode from 'jwt-decode';

export interface IAuthDetails {
    token: string;
    filesToken: string;
    activeCompany: any;
}

@Injectable()
export class AuthService {
    @Output()
    public requestAuthentication$: EventEmitter<any> = new EventEmitter();

    @Output()
    public companyChange: EventEmitter<any> = new EventEmitter();

    private headers: Headers = new Headers({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    });

    public authentication$: ReplaySubject<IAuthDetails> = new ReplaySubject<IAuthDetails>(1);
    public jwt: string;
    public jwtDecoded: any;
    public activeCompany: any;
    public companySettings: any;
    public filesToken: string;

    constructor(private router: Router, private http: Http) {
        this.activeCompany = JSON.parse(localStorage.getItem('activeCompany')) || undefined;
        this.jwt = localStorage.getItem('jwt') || undefined;
        this.jwtDecoded = this.decodeToken(this.jwt);
        this.filesToken = localStorage.getItem('filesToken');

        if (this.isAuthenticated()) {
            this.authentication$.next({
                token: this.jwt,
                filesToken: this.filesToken,
                activeCompany: this.activeCompany
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
    /**
     * Authenticates the user and returns an observable of the response
     * @param {Object} credentials
     * @returns Observable
     */
    public authenticate(credentials: {username: string, password: string}): Observable<boolean> {
        let url = AppConfig.BASE_URL_INIT + AppConfig.API_DOMAINS.INIT + 'sign-in';

        return this.http.post(url, JSON.stringify(credentials), {headers: this.headers})
            .finally(() => this.authenticateUniFiles())
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

    public authenticateUniFiles() {
        if (!this.jwt) {
            return;
        }

        const uniFilesUrl = AppConfig.BASE_URL_FILES + '/api/init/sign-in';
        this.http.post(uniFilesUrl, JSON.stringify(this.jwt), {headers: this.headers}).subscribe(
            res => {
                if (res && res.status === 200) {
                    this.filesToken = res.json();
                    localStorage.setItem('filesToken', this.filesToken);

                    this.authentication$.next({
                        token: this.jwt,
                        filesToken: this.filesToken,
                        activeCompany: this.activeCompany
                    });
                }
            },
            err => console.log(err)
        );
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
     * Sets the current active company
     * @param {Object} activeCompany
     */
    public setActiveCompany(activeCompany: any): void {
        localStorage.setItem('activeCompany', JSON.stringify(activeCompany));
        localStorage.setItem('lastActiveCompanyKey', activeCompany.Key);

        this.activeCompany = activeCompany;
        this.authentication$.next({
            token: this.jwt,
            filesToken: this.filesToken,
            activeCompany: activeCompany
        });
        this.companyChange.emit(this.activeCompany);
    }

    /**
     * Returns the current active company
     * @returns {Object}
     */
    public getActiveCompany() {
        return this.activeCompany;
    }

    /**
     * Returns the current active companykey string
     */
    public getCompanyKey(): string {
        return this.getActiveCompany()['Key'];
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
            this.authentication$.next({token: undefined, filesToken: undefined, activeCompany: undefined});
        }

        let url = AppConfig.BASE_URL_INIT + AppConfig.API_DOMAINS.INIT + 'log-out';
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.jwt,
            'CompanyKey': this.activeCompany
        });
        this.http.post(url, '', {headers: headers})
            .subscribe(
                () => console.log('User logged out sucessfully'),
                err => console.error('Error:JWT token is still valid.', err)
            );

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
}
