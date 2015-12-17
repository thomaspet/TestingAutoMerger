import { Injectable, EventEmitter } from 'angular2/core';
import { Http, Headers, Response } from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/share';

declare var jwt_decode: (token: string) => any; // node_modules/jwt_decode

@Injectable()
export class AuthService {
	// authenticated$: Observable<boolean>;
	// private authenticatedObserver: any;
	
	constructor(private http: Http) {
		// this.authenticated$ = new Observable(observer => this.authenticatedObserver = observer)
		// .share();
	}
	
	authenticate(username: string, password: string): Observable<Response> {
		var serializedParams = 'username=' + username + '&password=' + password + '&grant_type=password';
		var reqHeaders = new Headers({
			'Content-type': 'application/x-www-form-urlencoded'
		});
		
		return this.http.post(
			'https://uni-identity.azurewebsites.net/oauth/master-key', 
			serializedParams,
			{ headers: reqHeaders }
		);
	}
	
	decodeToken(token: string) {
		return jwt_decode(token);
	}	
	
	get authenticated(): boolean {
		var token = localStorage.getItem('jwt');
		return (token && !this.expired);
	}
	
	get expired(): boolean {
		var decoded = JSON.parse(localStorage.getItem('jwt_decoded'));
		
		if (!decoded || !decoded.exp) {
			return true;
		}
		
		var expires = new Date(0);
		expires.setUTCSeconds(decoded.exp);
		
		return (new Date().valueOf() > expires.valueOf());		
	}
	
}