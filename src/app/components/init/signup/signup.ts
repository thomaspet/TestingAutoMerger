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
    private verificationCode: string;
    private passwordMismatch: boolean;
    private busy: boolean;

    private successMessage: string;
    private errorMessage: string = 'Test av feilmelding';

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

        this.step2Form.controls['Password'].valueChanges.subscribe(value => {
            this.checkForPasswordMismatch();
        });

        this.step2Form.controls['ConfirmPassword'].valueChanges.subscribe(value => {
            this.checkForPasswordMismatch();
        });

        this.route.queryParams.subscribe(params => {
            this.successMessage = undefined;
            this.errorMessage = undefined;

            // TODO: find out what the route param is
            if (params['code']) {
                this.verificationCode = params['code'];
                this.step1Form.disable();
                this.step1Form.setValue({
                    CompanyName: 'Olas Testdata AS',
                    DisplayName: 'Ola Nordmann',
                    Email: 'ola@example.com',
                    PhoneNumber: '93289294'
                });

                // this.http.asGET()
                //     .usingInitDomain()
                //     .withEndPoint('confirmation-code/' + this.verificationCode)
                //     .send()
                //     .subscribe(
                //         res => {
                //             this.verificationCode = params['code'];
                //             this.step1Form.disable();
                //         },
                //         err => {
                //             // any other reasons this would give error?
                //             this.errorMessage = 'Ugyldig registreringskode, vennligst prøv igjen';
                //         }
                //     );
            }
        });
    }

    public submitStep1Form() {
        // TODO: is form valid?

        this.busy = true;
        setTimeout(() => {
            console.log('Request body: ', this.step1Form.value);
            this.step1Form.disable();
            this.busy = false;
            this.successMessage = 'Vi vil nå verifisere eposten din, vennligst sjekk innboks for videre informasjon';
        }, 1500);

        // this.http.asPOST()
        //     .usingInitDomain()
        //     .withEndPoint('confirm-email')
        //     .withBody(this.step1Form.value) // stringify?
        //     .send()
        //     .subscribe(
        //         res => {
        //             this.successMessage = 'Vi vil nå verifisere eposten din, vennligst sjekk epost for videre informasjon';
        //         },
        //         err => {
        //             console.log('Should this error??', err);
        //         },
        //         () => this.busy = false
        //     );
    }

    public submitStep2Form() {
        this.busy = true;
        const requestBody = Object.assign({}, this.step1Form.value, this.step2Form.value);

        setTimeout(() => {
            console.log('Request body: ', requestBody);
            this.step2Form.disable();
            this.busy = false;
            this.successMessage = 'Vi setter nå opp selskapet ditt. En epost blir automatisk sendt ut når kontoen er klar for bruk.';
        }, 1500);

        // this.http.asPOST()
        //     .usingInitDomain()
        //     .withEndPoint('sign-up')
        //     .withBody(requestBody) // stringify?
        //     .send()
        //     .subscribe(
        //         res => {
        //             this.successMessage = 'Vi setter nå opp selskapet ditt. En epost blir automatisk sendt ut når kontoen er klar for bruk.'
        //         },
        //         err => {
        //             this.errorMessage = 'Noe gikk galt under registrering, vennligst prøv igjen';
        //         },
        //         () => this.busy = false
        //     );
    }

    public checkForPasswordMismatch() {
        const password = this.step2Form.controls['Password'];
        const confirmPassword = this.step2Form.controls['ConfirmPassword'];

        // Dont validate password match before both are valid to avoid spamming the user
        this.passwordMismatch = password.valid && confirmPassword.valid
            && password.value !== confirmPassword.value;
    }
}
