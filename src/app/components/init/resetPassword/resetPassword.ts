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
    private code: string;
    private userid: string;

    private busy: boolean = false;
    private emailSent: boolean = false;
    private passwordChanged: boolean = false;

    private successMessage: string = '';
    private errorMessage: string = '';
    private emailForm: FormGroup;
    private passwordForm: FormGroup;

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
                    this.successMessage = 'Vennligst sjekk epost innboksen din for videre instrukser';
                    this.busy = false;
                    this.emailSent = true;
                },
                (error) => {
                    if (error.status === 404) {
                        this.errorMessage = 'Vi klarte ikke finne en aktiv bruker. Er epost korrekt?';
                    } else {
                        this.errorMessage = 'Noe gikk galt, vennligst prøv igjen';
                    }
                    this.busy = false;
                    this.logger.exception(error);
                }
            );
    }

    public resetPassword() {
        if(!this.passwordForm.valid){
            this.passwordForm.controls.Password.markAsTouched() 
            this.passwordForm.controls.ConfirmPassword.markAsTouched()
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
