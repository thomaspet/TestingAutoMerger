import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {passwordValidator} from '../authValidators';
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
    private passwordsMatch: boolean = false;

    private successMessage: string = '';
    private errorMessage: string = '';
    private emailForm: FormGroup;
    private passwordForm: FormGroup;

    constructor(private route: ActivatedRoute, private uniHttp: UniHttp, private logger: Logger) {
        this.route.queryParams.subscribe(params => {
            this.code = params['code'];
            this.userid = params['userid'];
        });

        var validator = Validators.compose([
            passwordValidator,
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(16)
        ]);

        this.emailForm = new FormGroup({
            email: new FormControl('', Validators.required)
        });

        let passwordCtrl = new FormControl('', validator);
        let confirmPasswordCtrl = new FormControl('', validator);

        // TODO: This should be handled through a validator!
        passwordCtrl.valueChanges.subscribe((value) => {
            this.passwordsMatch = (value === confirmPasswordCtrl.value);
            console.log(this.passwordsMatch);
        });
        confirmPasswordCtrl.valueChanges.subscribe((value) => {
            this.passwordsMatch = (value === passwordCtrl.value);
            console.log(this.passwordsMatch);
        });

        this.passwordForm = new FormGroup({
            password: passwordCtrl,
            confirmPassword: confirmPasswordCtrl
        });

    }

    private sendResetEmail() {
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
                    if (response.status === 200) {
                        this.successMessage = 'Vennligst sjekk epost innboksen din for videre instrukser';
                        this.busy = false;
                        this.emailSent = true;
                    }
                },
                (error) => {
                    if (error.status === 404) {
                        this.errorMessage = 'Vi klarte ikke finne en aktiv bruker. Er epost korrekt?';
                    }
                    this.busy = false;
                    this.logger.exception(error);
                }
            );
    }

    private resetPassword() {
        this.busy = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.uniHttp.asPOST()
            .usingInitDomain()
            .withEndPoint('reset-password')
            .withBody({
                newpassword: this.passwordForm.controls['password'].value,
                resetpasswordcode: decodeURIComponent(this.code),
                userid: decodeURIComponent(this.userid)
            })
            .send()
            .subscribe(
                (response) => {
                    if (response.status === 200) {
                        this.passwordChanged = true;
                        this.busy = false;
                    }
                },
                (error) => {
                    this.busy = false;
                    this.errorMessage = 'Noe gikk galt. Vennligst prøv igjen';
                }
            );

    }
}
