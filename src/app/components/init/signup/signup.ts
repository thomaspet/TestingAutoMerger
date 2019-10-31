import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormControl, Validators, FormGroup} from '@angular/forms';
import {UniHttp} from '@uni-framework/core/http/http';
import {passwordValidator, passwordMatchValidator} from '../authValidators';

@Component({
    selector: 'uni-signup',
    templateUrl: './signup.html',
    styleUrls: ['./signup.sass']
})
export class Signup {
    confirmationCode: string;
    busy: boolean;

    errorMessage: string;
    step1Success: boolean;

    step1Form: FormGroup;
    step2Form: FormGroup;

    step1Successful: boolean;
    step2Successful: boolean;
    invalidConfirmationCode: boolean;
    userExists: boolean;

    constructor(
        private http: UniHttp,
        private route: ActivatedRoute,
        formBuilder: FormBuilder
    ) {
        this.step1Form = formBuilder.group({
            DisplayName: new FormControl('', Validators.required),
            Email: new FormControl('', [Validators.required, Validators.email]),
            SignUpReferrer: new FormControl(document.referrer),
            RecaptchaResponse: new FormControl('', Validators.required)
        });

        this.step2Form = formBuilder.group({
            Password: new FormControl('', [Validators.required, passwordValidator]),
            ConfirmPassword: new FormControl('', [Validators.required, passwordValidator])
        }, {
            validator: passwordMatchValidator
        });

        this.route.queryParams.subscribe(params => {
            this.step1Success = false;
            this.errorMessage = undefined;

            if (params['code']) {
                this.confirmationCode = params['code'];
                this.validateConfirmationCode(this.confirmationCode);
                this.step1Form.disable();
            } else {
                this.step1Form.enable();
                this.step2Form.disable();
                this.confirmationCode = null;
            }
        });
    }

    public submitStep1Form() {
        this.step1Form.disable();
        this.busy = true;
        this.errorMessage = '';

        this.step1Success = true;
        this.busy = false;

        this.http.asPOST()
            .usingInitDomain()
            .withEndPoint('sign-up')
            .withBody(this.step1Form.value)
            .send()
            .subscribe(
                () => {
                    this.busy = false;
                    this.step1Successful = true;
                },
                err => {
                    this.step1Success = false;
                    this.step1Form.enable();
                    this.busy = false;
                    this.step1Successful = false;
                    grecaptcha.reset();
                    this.step1Form.value.RecaptchaResponse = null;

                    this.errorMessage = err && err.error && err.error.Message;
                    if (!this.errorMessage) {
                        this.errorMessage = 'Noe gikk galt under verifisering. Vennligst sjekk detaljer og prøv igjen.';
                    }
                }
            );
    }

    public submitStep2Form() {
        if (!this.step2Form.valid) {
            this.errorMessage = 'Skjemaet er ikke gyldig. Vennligst påse at alle felter er fylt ut i henhold til kravene.';

            this.step2Form.controls.Password.markAsTouched();
            this.step2Form.controls.ConfirmPassword.markAsTouched();
            return;
        }

        this.errorMessage = '';
        this.busy = true;
        const formValues = this.step2Form.value;

        const requestBody = {
            Password: formValues.Password,
            ConfirmationCode: this.confirmationCode
        };

        this.http.asPOST()
            .usingInitDomain()
            .withEndPoint('register-user')
            .withBody(requestBody)
            .send()
            .subscribe(
                res => {
                    this.step2Successful = true;
                },
                err => {
                    this.busy = false;
                    this.step2Successful = false;
                    let errorMessage;

                    console.log(err);

                    try {
                        const errorBody = err.error;
                        errorMessage = errorBody.Message || errorBody.Messages[0].Message;
                    } catch (error) {}

                    this.errorMessage = errorMessage || 'Noe gikk galt under registrering, vennligst prøv igjen';
                }
            );
    }

    public validateConfirmationCode(code) {
        this.http.asGET()
            .usingInitDomain()
            .withEndPoint(`validate-confirmation?code=${code}`)
            .send()
            .subscribe(
                () => this.invalidConfirmationCode = false,
                err => {

                    // Try catch to avoid having to null check everything
                    try {
                        const errorBody = err.body;
                        this.userExists = errorBody.Messages[0].Message.toLowerCase().indexOf('user') >= 0;
                    } catch (e) { }

                    if (this.userExists) {
                        this.errorMessage = 'Du er allerede registrert. Vennligst gå til innloggingssiden.';
                    } else {
                        this.errorMessage = 'Bekreftelseskoden er utløpt. Vennligst prøv å registrere deg igjen.';
                        this.invalidConfirmationCode = true;
                    }

                    this.busy = false;
                }
            );
    }
}
