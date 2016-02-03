import { Injectable, EventEmitter } from 'angular2/core';
import { Http, Headers, Response } from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';

declare var jwt_decode: (token: string) => any; // node_modules/jwt_decode

@Injectable()
export class AuthService {
    jwt: any;
    jwt_decoded: any;
    errorMessage: string;
    
    authenticated$: Observable<boolean>;
    private _authenticatedObserver: any;
    
    authenticated: boolean;
    
	constructor(private http: Http) {
        this.authenticated$ = new Observable((observer) => {
            this._authenticatedObserver = observer;
        }).share();
        
        // Get jwt and jwt_decoded from localStorage if they exist
        this.jwt = localStorage.getItem('jwt') || null;
        this.jwt_decoded = JSON.parse(localStorage.getItem('jwt_decoded')) || null;
        
        // If jwt_decoded does not exist in localStorage, we decode and store it
        if (this.jwt && !this.jwt_decoded) {
            this.jwt_decoded = this.decodeToken(this.jwt);
            localStorage.setItem('jwt_decoded', this.jwt_decoded);
        }
    }

    
    login(username: string, password: string): void {
        var serializedParams = 'username=' + username + '&password=' + password + '&grant_type=password';
		var reqHeaders = new Headers({
			'Content-type': 'application/x-www-form-urlencoded'
		});
        
        this.http.post(
			'https://uni-identity.azurewebsites.net/oauth/master-key', 
			serializedParams,
			{ headers: reqHeaders }
		).map((res) => res.json())
        .subscribe(
            (response) => {
                this.jwt = response.access_token;
                this.jwt_decoded = this.decodeToken(this.jwt);
                this.errorMessage = '';
                
                localStorage.setItem('jwt', this.jwt);
                localStorage.setItem('jwt_decoded', JSON.stringify(this.jwt_decoded));
                
                this.validateAuthentication();
            },
            (error) => {
                this.errorMessage = error.error_description;
                this._authenticatedObserver.next(false);
            }
        );
    }
    
    logout(): void {
        localStorage.removeItem('jwt');
        localStorage.removeItem('jwt_decoded');
        this.jwt = null;
        this.jwt_decoded = null;
        
        this._authenticatedObserver.next(false);
    }
	
	decodeToken(token: string) {
		return jwt_decode(token);
	}	
	
	validateAuthentication(): boolean {
	    if (!this.jwt || !this.jwt_decoded) return false;
        
        var isValid = !this.isTokenExpired(this.jwt_decoded);
        
        this._authenticatedObserver.next(isValid);
        return isValid;        
	}
    
    isTokenExpired(decodedToken, offsetSeconds?: number): boolean {
		var offsetSeconds = offsetSeconds || 0;
        
        var expires = new Date(0);
		expires.setUTCSeconds(decodedToken.exp);
		
		return ( expires.valueOf() < new Date().valueOf() + (offsetSeconds * 1000) );		
	}
	
}