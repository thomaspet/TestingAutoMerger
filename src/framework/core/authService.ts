import {Injectable, Inject} from 'angular2/core';
import {Router} from 'angular2/router';
import {Http, Headers} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import {AppConfig} from '../../app/AppConfig';
import 'rxjs/add/operator/map';

declare var jwt_decode: (token: string) => any; // node_modules/jwt_decode

@Injectable()
export class AuthService {
    public jwt: string;
    public jwtDecoded: any;
    public activeCompany: any;
    public expiredToken: boolean;

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
    }
    
    /**
     * Authenticates the user and returns an observable of the response
     * @param {Object} credentials
     * @returns Observable
     */
    public authenticate(credentials: {username: string, password: string}): Observable<any> {
        let url = AppConfig.BASE_URL + AppConfig.API_DOMAINS.INIT + 'sign-in';
        let headers = new Headers({'Content-Type': 'application/json'});
        
        return this.http.post(url, JSON.stringify(credentials), {headers: headers})
            .map(response => response.json());
    }
    
    /**
     * Returns an observable of the available companies for the authenticated user
     * @returns Observable
     */
    public getCompanies(): Observable<any[]> {
        let url = AppConfig.BASE_URL + AppConfig.API_DOMAINS.INIT + 'companies';
        let headers = new Headers({'Authorization': 'Bearer ' + this.jwt});
        
        return this.http.get(url, {headers: headers})
            .map(response => response.json());
    }
    
    public setToken(token: string) {
        this.jwt = token;
        localStorage.setItem('jwt', this.jwt);
        this.jwtDecoded = this.decodeToken(this.jwt);
        this.expiredToken = false;
    }
    
    /**
     * Returns web token or redirects to /login if user is not authenticated
     * @returns {String}
     */
    public getToken(): string {
        if (!this.isAuthenticated()) {
            this.router.navigate(['Login']);
            return;
        }
        
        return this.jwt;
    }
    
    /**
     * Sets the current active company
     * @param {Object} activeCompany
     */
    public setActiveCompany(activeCompany: any): void {
        localStorage.setItem('activeCompany', JSON.stringify(activeCompany));
        this.activeCompany = activeCompany;
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

}
