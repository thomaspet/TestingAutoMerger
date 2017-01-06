import {Component} from '@angular/core';
import {FormControl, Validators, FormGroup} from '@angular/forms';
import {UniHttp} from '../../../../framework/core/http/http';
import {passwordValidator} from '../authValidators';

@Component({
    selector: 'uni-signup',
    templateUrl: 'app/components/init/signup/signup.html'
})
export class Signup {
    private companyForm: FormGroup;
    private userForm: FormGroup;
    private emailChecked: boolean;
    private existingUser: Object;

    private working: boolean = false;
    private passwordsMatching: boolean = false;
    private success: boolean = false;
    private errorMessage: string = '';

    constructor(private _http: UniHttp) {
        this.companyForm = new FormGroup({
            Email: new FormControl('', Validators.required),
            CompanyName: new FormControl('', Validators.required)
        });
    }

    private usernameValidator(control) {
        const valid = /^[a-z0-9]+$/i.test(control.value);
        return valid ? null : {
            'validUsername': valid
        };
    }

    private checkEmail() {
        this.working = true;
        const uriEncoded = encodeURIComponent(this.companyForm.controls['Email'].value);

        const passwordValidators = Validators.compose([
            passwordValidator,
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(16)
        ]);

        const usernameValidators = Validators.compose([
            Validators.required,
            this.usernameValidator
        ]);

        this._http.asGET()
            .usingInitDomain()
            .withEndPoint('users?email=' + uriEncoded)
            .send()
            .map(response => response.json())
            .subscribe(
                // Provided email is already a user
                (response) => {
                    if (response['UserName'] && response['FullName']) {
                        this.existingUser = response;
                        this.submitDetails();
                    }
                },
                // Provided email is a new user
                (error) => {
                    this.userForm = new FormGroup({
                        Name: new FormControl('', Validators.required),
                        UserName: new FormControl('', usernameValidators),
                        Password: new FormControl('', passwordValidators),
                        ConfirmPassword: new FormControl('', passwordValidators),
                    });

                    this.userForm.controls['Password'].valueChanges.subscribe((value) => {
                        this.passwordsMatching = (value === this.userForm.controls['ConfirmPassword'].value);
                    });

                    this.userForm.controls['ConfirmPassword'].valueChanges.subscribe((value) => {
                        this.passwordsMatching = (value === this.userForm.controls['Password'].value);
                    });

                    this.emailChecked = true;
                    this.working = false;
                }
            );
    }

    private submitDetails() {
        this.errorMessage = '';
        this.working = true;

        let body = this.existingUser || {};
        body['Email'] = this.companyForm.controls['Email'].value;
        body['CompanyName'] = this.companyForm.controls['CompanyName'].value;
        body['IsTest'] = false;

        if (!this.existingUser) {
            body['Name'] = this.userForm.controls['Name'].value;
            body['UserName'] = this.userForm.controls['UserName'].value;
            body['Password'] = this.userForm.controls['Password'].value;
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
