import {Component} from '@angular/core';
import {Router, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {UniHttp} from '../../../framework/core/http/http';
import {Control, Validators, ControlGroup, FORM_DIRECTIVES} from '@angular/common';
import {passwordValidator} from './authValidators';

@Component({
    selector: 'uni-signup',
    templateUrl: 'app/components/init/signup.html',
    directives: [ROUTER_DIRECTIVES, FORM_DIRECTIVES]
})
export class Signup {
    private emailForm: ControlGroup = undefined;
    private detailsForm: ControlGroup = undefined;
    private isTest: boolean = false;
    
    private passwordsMatching: boolean = false;
    
    private working: boolean = false;
    private existingUser: Object;
    private success: boolean = false;    
    private errorMessage: string = '';


    constructor(private _http: UniHttp, private _router: Router) {
        this.emailForm = new ControlGroup({
            Email: new Control('', Validators.required)
        });
    }
    
    private checkEmail() {
        this.working = true;
        
        let uriEncoded = encodeURIComponent(this.emailForm.controls['Email'].value);
        
        let passwordValidators = Validators.compose([
            passwordValidator,
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(16)
        ]);
     
        this._http.asGET()
            .usingInitDomain()
            .withEndPoint('users?email=' + uriEncoded)
            .send()
            .subscribe(
                (response) => {                                        
                    if (response['UserName'] && response['FullName']) {                        
                        this.detailsForm = new ControlGroup({
                            CompanyName: new Control('', Validators.required)
                        });
                        
                        this.existingUser = response;
                        this.working = false;
                    }
                }, 
                (error) => {
                    this.detailsForm = new ControlGroup({
                        Name: new Control('', Validators.required),
                        UserName: new Control('', Validators.required),
                        CompanyName: new Control('', Validators.required),
                        Password: new Control('', passwordValidators),
                        ConfirmPassword: new Control('', passwordValidators),
                    });
                    
                    this.detailsForm.controls['Password'].valueChanges.subscribe((value) => {
                        this.passwordsMatching = (value === this.detailsForm.controls['ConfirmPassword'].value);
                    });
                    
                    this.detailsForm.controls['ConfirmPassword'].valueChanges.subscribe((value) => {
                        this.passwordsMatching = (value === this.detailsForm.controls['Password'].value);
                    });
                    
                    this.existingUser = false;
                    this.working = false;
                }
            );
    }
    
    private submitDetails() {
        this.errorMessage = '';
        this.working = true;

        let controls = this.detailsForm.controls;        
        let body = this.existingUser || {};
        
        body['Email'] = this.emailForm.controls['Email'].value;
        body['CompanyName'] = controls['CompanyName'].value;
        body['IsTest'] = this.isTest;
        
        if (!this.existingUser) {
            body['Name'] = controls['Name'].value;
            body['UserName'] = controls['UserName'].value;
            body['Password'] = controls['Password'].value;
            body['Secret'] = 'uni2016';
        }
        
        this._http.asPOST()
            .usingInitDomain()
            .withEndPoint('sign-up')
            .withBody(body)
            .send({}, true)
            .subscribe(
                (response) => {
                    if (response.status === 200) {
                        this.success = true;
                        this.working = false;
                    }
                },
                (error) => {
                    this.working = false;
                    this.errorMessage = 'Noe gikk galt under registrering. Vennligst sjekk detaljer og prøv igjen.';
                }
            );
    }
}
