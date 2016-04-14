import {Component} from 'angular2/core';
import {Router, ROUTER_DIRECTIVES} from 'angular2/router';
import {UniHttp} from '../../../framework/core/http/http';
import {Control, Validators, ControlGroup, FORM_DIRECTIVES} from 'angular2/common';
import {passwordValidator} from './authValidators';

@Component({
    selector: 'uni-signup',
    templateUrl: 'app/components/authentication/signup.html',
    directives: [ROUTER_DIRECTIVES, FORM_DIRECTIVES]
})
export class Signup {
    private form: ControlGroup;

    constructor(private _http: UniHttp, private _router: Router) {
        let passwordValidators = Validators.compose([
            passwordValidator,
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(16)
        ]);
        
        this.form = new ControlGroup({
            Name: new Control('', Validators.required),
            CompanyName: new Control('', Validators.required),
            Email: new Control('', Validators.required),
            UserName: new Control('', Validators.required),
            Password: new Control('', passwordValidators),
        });
    }

    private signup() {        
        let body = {
            Name: this.form.controls['Name'].value,
            CompanyName: this.form.controls['CompanyName'].value,
            Email: this.form.controls['Email'].value,
            UserName: this.form.controls['UserName'].value,
            Password: this.form.controls['Password'].value,
        };
        
        this._http.asPOST()
            .usingInitDomain()
            .withEndPoint('sign-up')
            .withBody(body)
            .send()
            .subscribe(
                (response) => {
                    this._router.navigate(['Login']);       
                },
                error => console.log(error)
            );

    }
}