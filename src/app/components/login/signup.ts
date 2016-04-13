import {Component} from 'angular2/core';
import {Router, ROUTER_DIRECTIVES} from 'angular2/router';
import {UniHttp} from '../../../framework/core/http/http';

@Component({
    selector: 'uni-signup',
    templateUrl: 'app/components/login/signup.html',
    directives: [ROUTER_DIRECTIVES]
})
export class Signup {
    private user: {
        Name: string,
        CompanyName: string,
        Email: string,
        UserName: string,
        Password: string,
        IsTest: boolean
    };

    constructor(private _http: UniHttp, private _router: Router) {
        this.user = {
            Name: '',
            CompanyName: '',
            Email: '',
            UserName: '',
            Password: '',
            IsTest: true
        };
    }

    private signup(event) {
        event.preventDefault();
        
        this._http.asPOST()
            .usingInitDomain()
            .withEndPoint('sign-up')
            .withHeader('Content-Type', 'application/json')
            .withBody(this.user)
            .send()
            .subscribe(
                (response) => {
                    this._router.navigate(['Login']);       
                },
                error => console.log(error)
            );

    }
}