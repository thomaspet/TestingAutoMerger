import { Injectable, Observable } from 'angular2/angular2';
import { Http, Headers, Response } from 'angular2/http';

declare var jwt_decode: (token: string) => any; // node_modules/jwt_decode

@Injectable()
export class AuthService {
	http: Http;
	
	constructor(http: Http) {
		this.http = http;	
	}
	
	serializeParams(username, password): string {
		return 'username=' + username + '&password=' + password + '&grant_type=password';
	}
	
	authenticate(username: string, password: string): Observable<any> {
		var headers = new Headers();
		headers.append('Content-type', 'application/x-www-form-urlencoded');
		
		return this.http.post(
			'https://uni-identity.azurewebsites.net/oauth/master-key', 
			// request body
			this.serializeParams(username, password),
			
			// request headers
			{ headers: headers }
		)
		.map((res: any) => res.json());
	}
	
	decodeToken(token: string) {
		return jwt_decode(token);
	}
	
	isTokenExpired(): boolean {
		var token = JSON.parse(localStorage.getItem('jwt_decoded'));
		
		if (!token || typeof token.exp === 'undefined') {
			return true;
		}
		
		var expDate = new Date(0);
		expDate.setUTCSeconds(token.exp);
		
		return (new Date().valueOf() > expDate.valueOf());
	}
	
}