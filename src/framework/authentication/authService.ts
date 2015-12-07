// jwt.io
// Bearer <asdf>
	
// x-www-form-urlencoded
// username: jonterje
// password: MySuperP@ss!
// grant_type: password
	
// response.access_token

import { Injectable, Observable } from 'angular2/angular2';
import { Http, Headers, Response } from 'angular2/http';

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
		
	}
}