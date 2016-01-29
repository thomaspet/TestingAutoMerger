import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Http, Headers, Response} from 'angular2/http';

@Component({
    selector: 'uni-signup',
    templateUrl: 'app/components/login/signup.html',
    directives: [ROUTER_DIRECTIVES]
})
export class Signup {
    newUser: { 
        companyName: string,
        name: string,
        email: string,
        username: string,
        password: string    
    }
    
    constructor(private http: Http) {
        this.newUser = {
            companyName: '',
            name: '',
            email: '',
            username: '',
            password: ''
        }
    }
    
    signUp(event) {
        event.preventDefault();
        
        var serializedParams = 'company-name=' + this.newUser.companyName +
            '&name=' + this.newUser.name + '&email=' + this.newUser.email +
            '&user-name=' + this.newUser.username + '&password=' + this.newUser.password;
        
        // POST to api endpoint. Should use http service when its ready 
        this.http.post('http://devapi.unieconomy.no:80/api/biz/companies', 
            serializedParams,
            { headers: new Headers({'Client': 'client1'}) } 
        )
        .subscribe(
            (response) => {
                console.log(response);
            },
            (error) => {
                console.log(error);
            }
        )
        
        // authenticate with the newly created user, or wait for email confirmation?
    }
}