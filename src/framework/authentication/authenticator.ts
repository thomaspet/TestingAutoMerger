// jwt.io
// Bearer <asdf>
	
// x-www-form-urlencoded
// username: jonterje
// password: MySuperP@ss!
// grant_type: password
	
// response.access_token

import { Injectable } from 'angular2/angular2';
import { Http, Headers, Response } from 'angular2/http';

@Injectable()
export class Authenticator {
	http: Http;
	
	constructor(http: Http) {
		this.http = http;
	}
	
	authenticate(username: string, password: string) {
		
		this.http.post(
			'https://uni-identity.azurewebsites.net/oauth/master-key ', 
			// request body
			JSON.stringify({
				username: username,
				password: password,
				grant_type: 'password'
			}),
			// headers
			new Headers({
				'Accept': 'application/json',
				'Content-type': 'application/x-www-form-urlencoded'
			})
		)
		.map((res: any) => res.json())
		.subscribe (
			data => {
				localStorage.setItem('jwt', data.access_token);
				return true;
			},
			err => {
				console.log(err);
				return false;
			}
		);
		
	}	
}