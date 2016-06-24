import {Injectable, Inject, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router-deprecated';
import {Http, Headers} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {AppConfig} from '../../app/AppConfig';

import {StaticRegisterService} from '../../app/services/staticregisterservice';

import 'rxjs/add/operator/map';

declare var jwt_decode: (token: string) => any; // node_modules/jwt_decode

@Injectable()
export class AuthService {
    @Output()
    public authenticationStatus$: EventEmitter<any> = new EventEmitter();
    
    @Output()
    public companyChanged$: EventEmitter<any> = new EventEmitter();

    @Output()
    public requestAuthentication$: EventEmitter<any> = new EventEmitter();
    
    public jwt: string;
    public jwtDecoded: any;
    public activeCompany: any;
    public expiredToken: boolean;
    public companySettings : any;
    public lastTokenUpdate: Date;

    constructor(@Inject(Router) private router: Router, @Inject(Http) private http: Http) {           
        this.activeCompany = JSON.parse(localStorage.getItem('activeCompany')) || undefined;
        this.jwt = localStorage.getItem('jwt') || undefined;
        this.jwtDecoded = this.decodeToken(this.jwt);
        
        // Store expired state in class variable and update every 25 seconds (with 30 seconds offset).
        // This is done because navbar will check expired state in ngIf, and we dont want to perform the check 
        // multiple times every second.
        this.expiredToken = this.isTokenExpired(this.jwt);
        setInterval(() => {
            this.expiredToken = this.isTokenExpired(this.jwt, 30);
        }, 25000);
        
        this.emitAuthenticationStatus();
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
                    
                    this.expiredToken = false;
                    this.lastTokenUpdate = new Date();
                    
                    this.emitAuthenticationStatus();
                }
                
                return Observable.from([response.json()]);
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
     * Sets the current active company
     * @param {Object} activeCompany
     */
    public setActiveCompany(activeCompany: any): void {
        localStorage.setItem('activeCompany', JSON.stringify(activeCompany));
        this.activeCompany = activeCompany;
        
        this.companyChanged$.next(true);
        this.emitAuthenticationStatus();    
    }
    
    /**
     * Returns the current active company
     * @returns {Object}
     */
    public getActiveCompany() {
        return this.activeCompany;
    }
    
    /**
     * Returns a boolean indicating whether the user is authenticated or not
     * @returns {Boolean}
     */
    public isAuthenticated(): boolean {
        return (!!this.jwt && !!this.jwtDecoded && !this.expiredToken);
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
    public logout(): void {
        localStorage.removeItem('jwt');
        localStorage.removeItem('activeCompany');
        this.jwt = undefined;
        this.jwtDecoded = undefined;
        this.activeCompany = undefined;
        this.authenticationStatus$.emit(false);
        
        this.router.navigate(['Login']);
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
     * Returns a boolean indicating whether or not the token is expired
     * @param {Object} decodedToken
     * @param {Number} [offsetSeconds=0] offsetSecods
     * @returns {Boolean}
     */
    private isTokenExpired(decodedToken: any, offsetSeconds: number = 0): boolean {
        if (!decodedToken) {
            return true;
        }
        
        var expires = new Date(0);
        expires.setUTCSeconds(decodedToken.exp);
        return (expires.valueOf() < new Date().valueOf() + (offsetSeconds * 1000));
    }
    
    private emitAuthenticationStatus() {
        // Timeout to push emit to the back of the call stack
        // this allows app.ts to set up before we emit
        // (when emitting from constructor)
        setTimeout(() => {
            if (this.isAuthenticated() && this.hasActiveCompany()) {
                this.authenticationStatus$.emit(true);
            } else {
                this.authenticationStatus$.emit(false);
            }    
        });
    }
}
