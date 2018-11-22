import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl, FormGroup, FormBuilder, Validators} from '@angular/forms';
import {passwordValidator, passwordMatchValidator} from '../authValidators';
import {UniHttp} from '../../../../framework/core/http/http';
import {Logger} from '../../../../framework/core/logger';

@Component({
    selector: 'uni-reset-password',
    templateUrl: './resetPassword.html',
})
export class ResetPassword {
    public code: string;
    public userid: string;

    public busy: boolean = false;
    public emailSent: boolean = false;
    public passwordChanged: boolean = false;

    public successMessage: string = '';
    public errorMessage: string = '';
    public emailForm: FormGroup;
    public passwordForm: FormGroup;

    constructor(
        private route: ActivatedRoute,
        private uniHttp: UniHttp,
        private logger: Logger,
        private router: Router,
        private formBuilder: FormBuilder
    ) {
        this.route.queryParams.subscribe(params => {
            this.code = params['code'];
            this.userid = params['userid'];
        });

        this.emailForm = new FormGroup({
            email: new FormControl('', Validators.required)
        });

        this.passwordForm = formBuilder.group({
            Password: new FormControl('', [Validators.required, passwordValidator]),
            ConfirmPassword: new FormControl('', [Validators.required, passwordValidator])
        }, {
            validator: passwordMatchValidator
        });
    }

    public sendResetEmail() {
        this.busy = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.uniHttp.asPOST()
            .usingInitDomain()
            .withEndPoint('forgot-password')
            .withBody({'email': this.emailForm.controls['email'].value})
            .send()
            .subscribe(
                (response) => {
                    this.successMessage = 'Vennligst sjekk e-post innboksen din for videre instrukser';
                    this.busy = false;
                    this.emailSent = true;
                },
                (error) => {
                    if (error.status === 404) {
                        this.errorMessage = 'Vi klarte ikke finne en aktiv bruker. Er e-post korrekt?';
                    } else {
                        this.errorMessage = 'Noe gikk galt, vennligst prøv igjen';
                    }
                    this.busy = false;
                }
            );
    }

    public resetPassword() {
        if (!this.passwordForm.valid) {
            this.passwordForm.controls.Password.markAsTouched();
            this.passwordForm.controls.ConfirmPassword.markAsTouched();
            return;
        }

        this.busy = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.uniHttp.asPOST()
            .usingInitDomain()
            .withEndPoint('reset-password')
            .withBody({
                newpassword: this.passwordForm.controls['Password'].value,
                resetpasswordcode: decodeURIComponent(this.code),
                userid: decodeURIComponent(this.userid)
            })
            .send()
            .subscribe(
                (response) => {
                    if (response.status === 200) {
                        this.passwordChanged = true;
                        this.busy = false;
                        setTimeout(() => this.router.navigate(['/init/login']), 5000);
                    }
                },
                (error) => {
                    this.busy = false;
                    this.errorMessage = 'Noe gikk galt. Vennligst prøv igjen';
                }
            );

    }
}
