import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl, Validators, FormGroup} from '@angular/forms';
import {UniHttp} from '../../../../framework/core/http/http';
import {AuthService} from '../../../authService';
import {passwordValidator, passwordMatchValidator, usernameValidator} from '../authValidators';
import {Company} from '../../../unientities';

@Component({
    selector: 'uni-signup',
    templateUrl: './signup.html'
})
export class Signup {
    public confirmationCode: string;
    private recaptchaResponse: string;
    public busy: boolean;

    public successMessage: string;
    public errorMessage: string;

    public step1Form: FormGroup;
    public step2Form: FormGroup;

    constructor(
        private http: UniHttp,
        private route: ActivatedRoute,
        private authService: AuthService,
        private router: Router,
        formBuilder: FormBuilder
    ) {
        this.step1Form = formBuilder.group({
            CompanyName: new FormControl('', Validators.required),
            DisplayName: new FormControl('', Validators.required),
            Email: new FormControl('', [Validators.required, Validators.email]),
            PhoneNumber: new FormControl('', Validators.required),
            RecaptchaResponse: new FormControl('', Validators.required)
        });

        this.step2Form = formBuilder.group({
            UserName: new FormControl('', [Validators.required, usernameValidator]),
            Password: new FormControl('', [Validators.required, passwordValidator]),
            ConfirmPassword: new FormControl('', [Validators.required, passwordValidator])
        }, {
            validator: passwordMatchValidator
        });

        this.route.queryParams.subscribe(params => {
            this.successMessage = undefined;
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

        this.http.asPOST()
            .usingInitDomain()
            .withEndPoint('confirmation')
            .withBody(this.step1Form.value)
            .send()
            .subscribe(
                res => {
                    this.busy = false;
                    this.successMessage = 'Vi vil nå verifisere e-posten din. '
                        + 'Vennligst sjekk innboks for videre informasjon.';
                },
                err => {
                    this.step1Form.enable();
                    this.busy = false;
                    grecaptcha.reset();
                    this.step1Form.value.RecaptchaResponse = null;
                    try {
                        const errorBody = err.body;
                        if (errorBody.Message) {
                            this.errorMessage = errorBody.Message;
                        } else {
                            this.errorMessage = 'Noe gikk galt under verifisering.'
                            + 'Vennligst sjekk detaljer og prøv igjen.';
                        }
                    } catch (error) {
                        this.errorMessage = 'Noe gikk galt under verifisering.'
                        + 'Vennligst sjekk detaljer og prøv igjen.';
                    }
                }
            );
    }

    public submitStep2Form() {
        if (!this.step2Form.valid) {
            this.errorMessage = 'Skjemaet er ikke gyldig. Vennligst påse at alle felter er fylt ut i henhold til kravene.';

            this.step2Form.controls.Password.markAsTouched();
            this.step2Form.controls.ConfirmPassword.markAsTouched();
            this.step2Form.controls.UserName.markAsTouched();
            return;
        }

        this.errorMessage = '';
        this.busy = true;
        const formValues = this.step2Form.value;

        const requestBody = {
            UserName: formValues.UserName,
            Password: formValues.Password,
            ConfirmationCode: this.confirmationCode
        };

        this.http.asPOST()
            .usingInitDomain()
            .withEndPoint('register')
            .withBody(requestBody)
            .send()
            .subscribe(
                res => {
                    this.attemptLogin(requestBody.UserName, requestBody.Password, res.body);
                },
                err => {
                    this.busy = false;
                    let errorMessage;
                    try {
                        const errorBody = err.body;
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
                () => {},
                err => {
                    let usernameExists;

                    // Try catch to avoid having to null check everything
                    try {
                        const errorBody = err.body;
                        usernameExists = errorBody.Messages[0].Message.toLowerCase().indexOf('username') >= 0;
                    } catch (e) { }

                    if (usernameExists) {
                        this.errorMessage = 'Du er allerede registrert. Vennligst gå til innloggingssiden.';
                    } else {
                        this.errorMessage = 'Bekreftelseskoden er utløpt. Vennligst prøv å registrere deg igjen.';
                    }

                    this.busy = false;
                }
            );
    }

    public attemptLogin(
        username: string,
        password: string,
        company: Company
    ) {
        if (!company) {
            this.router.navigateByUrl('/init/login');
            return;
        }

        this.authService.authenticate();
    }

}
