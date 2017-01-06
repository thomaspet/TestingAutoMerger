import {Injectable, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {Http, Headers} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {AppConfig} from '../../app/appConfig';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/map';
declare var jwt_decode: (token: string) => any; // node_modules/jwt_decode

export interface IAuthDetails {
    token: string;
    activeCompany: any;
}

@Injectable()
export class AuthService {
    @Output()
    public requestAuthentication$: EventEmitter<any> = new EventEmitter();

    @Output()
    public companyChange: EventEmitter<any> = new EventEmitter();

    public authentication$: ReplaySubject<IAuthDetails> = new ReplaySubject<IAuthDetails>(1);
    public jwt: string;
    public jwtDecoded: any;
    public activeCompany: any;
    public companySettings: any;

    constructor(private router: Router, private http: Http) {
        this.activeCompany = JSON.parse(localStorage.getItem('activeCompany')) || undefined;
        this.jwt = localStorage.getItem('jwt') || undefined;
        this.jwtDecoded = this.decodeToken(this.jwt);

        if (this.isAuthenticated()) {
            this.authentication$.next({
                token: this.jwt,
                activeCompany: this.activeCompany
            });
        } else {
            this.clearAuthAndGotoLogin();
        }

        // Check expired status every minute, with a 10 minute offset on the expiration check
        // This allows the user to re-authenticate before http calls start 401'ing
        setInterval(() => {
            if (this.jwt && this.isTokenExpired(10)) {
                this.requestAuthentication$.emit(true);
            }
        }, 60000);
    }

    /**
     * Authenticates the user and returns an observable of the response
     * @param {Object} credentials
     * @returns Observable
     */
    public authenticate(credentials: {username: string, password: string}): Observable<any> {
        let url = AppConfig.BASE_URL_INIT + AppConfig.API_DOMAINS.INIT + 'sign-in';
        let headers = new Headers({'Content-Type': 'application/json', 'Accept': 'application/json'});

        return this.http.post(url, JSON.stringify(credentials), {headers: headers})
            .switchMap((response) => {
                if (response.status === 200) {
                    this.jwt = response.json().access_token;
                    this.jwtDecoded = this.decodeToken(this.jwt);
                    localStorage.setItem('jwt', this.jwt);
                }

                return Observable.of(response.json());
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
     * Sets the current active company
     * @param {Object} activeCompany
     */
    public setActiveCompany(activeCompany: any): void {
        localStorage.setItem('activeCompany', JSON.stringify(activeCompany));
        this.activeCompany = activeCompany;
        this.companyChange.emit(this.activeCompany);
        this.authentication$.next({token: this.jwt, activeCompany: activeCompany});
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
    public clearAuthAndGotoLogin(): void {
        localStorage.removeItem('jwt');
        localStorage.removeItem('activeCompany');
        localStorage.removeItem('activeFinancialYear');
        this.jwt = undefined;
        this.jwtDecoded = undefined;
        this.activeCompany = undefined;
        this.authentication$.next({token: undefined, activeCompany: undefined});
        this.router.navigateByUrl('init/login');
    }

    /**
     * Returns the decoded web token
     * @returns {Object}
     */
    private decodeToken(token: string) {
        if (!token) {
            return undefined;
        } else {
            return jwt_decode(token);
        }
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
