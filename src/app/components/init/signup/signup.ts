import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormControl, Validators, FormGroup} from '@angular/forms';
import {UniHttp} from '../../../../framework/core/http/http';
import {passwordValidator, passwordMatchValidator, usernameValidator} from '../authValidators';

@Component({
    selector: 'uni-signup',
    templateUrl: './signup.html'
})
export class Signup {
    private confirmationCode: string;
    private busy: boolean;

    private successMessage: string;
    private errorMessage: string;

    private step1Form: FormGroup;
    private step2Form: FormGroup;

    constructor(
        private http: UniHttp,
        private route: ActivatedRoute,
        formBuilder: FormBuilder
    ) {
        this.step1Form = formBuilder.group({
            CompanyName: new FormControl('', Validators.required),
            DisplayName: new FormControl('', Validators.required),
            Email: new FormControl('', [Validators.required, Validators.email]),
            PhoneNumber: new FormControl('', Validators.required)
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

            // TODO: find out what the route param is (from email link)
            if (params['code']) {
                this.confirmationCode = params['code'];
                this.step1Form.disable();
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
                    this.successMessage = 'Vi vil nå verifisere eposten din. Vennligst sjekk innboks for videre informasjon.';
                },
                err => {
                    this.busy = false;
                    this.step1Form.enable();

                    try {
                        const errorBody = err.json();
                        if (errorBody.Message.indexOf('Email') >= 0) {
                            this.errorMessage = 'Eposten er allerede i bruk';
                        }
                    } catch (e) {}

                    if (!this.errorMessage) {
                        this.errorMessage = 'Noe gikk galt under verifisering. Vennligst sjekk detaljer og prøv igjen.';
                    }
                }
            );
    }

    public submitStep2Form() {
        this.busy = true;
        const formValues = this.step2Form.value;

        let requestBody = {
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
                    this.successMessage = 'Vi setter nå opp selskapet ditt. En epost blir automatisk sendt ut når kontoen er klar for bruk.'
                    this.busy = false;
                },
                err => {
                    if (err.status === 404) {
                        this.errorMessage = 'Registrering er ikke tilgjengelig på nåværende tidspunkt. Vennligst prøv igjen senere';
                    } else {
                        this.errorMessage = 'Noe gikk galt under registrering, vennligst prøv igjen';
                    }

                    this.busy = false;
                }
            );
    }
}
