import {Component} from '@angular/core';
import {FormControl, Validators, FormGroup} from '@angular/forms';
import {UniHttp} from '../../../../framework/core/http/http';
import {passwordValidator} from '../authValidators';

@Component({
    selector: 'uni-signup',
    templateUrl: 'app/components/init/signup/signup.html'
})
export class Signup {
    private emailForm: FormGroup = undefined;
    private detailsForm: FormGroup = undefined;
    private isTest: boolean = false;

    private passwordsMatching: boolean = false;

    private working: boolean = false;
    private existingUser: Object;
    private success: boolean = false;
    private errorMessage: string = '';


    constructor(private _http: UniHttp) {
        this.emailForm = new FormGroup({
            Email: new FormControl('', Validators.required)
        });
    }

    private usernameValidator(control) {
        const valid = /^[a-z0-9]+$/i.test(control.value);
        console.log('valid: ' + valid);
        return valid ? null : {
            'validUsername': valid
        };
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

        let usernameValidators = Validators.compose([
            Validators.required,
            this.usernameValidator
        ]);

        this._http.asGET()
            .usingInitDomain()
            .withEndPoint('users?email=' + uriEncoded)
            .send()
            .map(response => response.json())
            .subscribe(
                (response) => {
                    if (response['UserName'] && response['FullName']) {
                        this.detailsForm = new FormGroup({
                            CompanyName: new FormControl('', Validators.required)
                        });

                        this.existingUser = response;
                        this.working = false;
                    }
                },
                (error) => {
                    this.detailsForm = new FormGroup({
                        Name: new FormControl('', Validators.required),
                        UserName: new FormControl('', usernameValidators),
                        CompanyName: new FormControl('', Validators.required),
                        Password: new FormControl('', passwordValidators),
                        ConfirmPassword: new FormControl('', passwordValidators),
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
            .send()
            .subscribe(
                (response) => {
                    this.success = true;
                    this.working = false;
                },
                (error) => {
                    this.working = false;
                    this.errorMessage = 'Noe gikk galt under registrering. Vennligst sjekk detaljer og prøv igjen.';
                }
            );
    }
}
