import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Http, Headers, Response, URLSearchParams} from 'angular2/http';

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
        
        var urlParams = new URLSearchParams();
        urlParams.append('company-name', 'Bedrift AS');
        urlParams.append('name', 'Anders Urrang');
        urlParams.append('email', 'kontakt@example.com');
        urlParams.append('user-name', 'anders');
        urlParams.append('password', 'anders1234');
        
        
        // POST to api endpoint. Should use http service when its ready 
        this.http.post('http://devapi.unieconomy.no/api/biz/companies', 
            JSON.stringify({"Name": "", "SchemaName": ""}),
            { 
                headers: new Headers({'Client': 'client1'}),
                search: urlParams
            } 
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