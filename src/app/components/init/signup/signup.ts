import {Component, ViewChild, HostBinding} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormControl, Validators, FormGroup} from '@angular/forms';
import {UniHttp} from '@uni-framework/core/http/http';
import {passwordValidator, passwordMatchValidator} from '../authValidators';
import {AuthService} from '@app/authService';
import {UniRecaptcha} from './recaptcha';
import {theme, THEMES} from 'src/themes/theme';
import {CelebrusService} from '@app/services/services';

@Component({
    selector: 'uni-signup',
    templateUrl: './signup.html',
    styleUrls: ['./signup.sass']
})
export class Signup {
    @ViewChild(UniRecaptcha) recaptcha: UniRecaptcha;

    @HostBinding('class.ext02-signup') isExt02Env = theme.theme === THEMES.EXT02;
    @HostBinding('class.sr-signup') srLogin = theme.theme === THEMES.SR;

    confirmationCode: string;
    busy: boolean;

    headerText = theme.theme === THEMES.SR ? 'Registrer bruker' : 'Prøv gratis i 30 dager';
    appName = theme.appName;

    errorMessage: string;

    step1Form: FormGroup;
    step2Form: FormGroup;

    step1Successful: boolean;
    step2Successful: boolean;
    invalidConfirmationCode: boolean;
    userExists: boolean;

    background = theme.theme === THEMES.SR ? theme.init.login_background : theme.init.background;
    backgroundHeight = theme.init.signup_background_height;
    illustration = theme.theme === THEMES.SR ? undefined : theme.init.illustration;

    agreeementText = theme.theme === THEMES.EXT02
        ? 'Ved å trykke på «start registrering» nedenfor får du en gratis, begrenset lisens til å teste funksjonalitet i DNB Regnskap i 30 dager. DNB vil behandle opplysninger om deg som du har oppgitt for å levere testtilgangen, for markedsføringsformål til din bedrift og for sikkerhetsformål.'
        : 'Jeg godtar lagring og bruk av mine data';


    recaptchaCode: string;

    constructor(
        public authService: AuthService,
        private http: UniHttp,
        private route: ActivatedRoute,
        private celebrusService: CelebrusService,
        formBuilder: FormBuilder,
    ) {
        this.step1Form = formBuilder.group({
            DisplayName: new FormControl('', Validators.required),
            Email: new FormControl('', [Validators.required, Validators.email]),
            PhoneNumber: new FormControl('', Validators.required),
            SignUpReferrer: new FormControl(window.location.href),
        });

        this.step2Form = formBuilder.group({
            Password: new FormControl('', [Validators.required, passwordValidator]),
            ConfirmPassword: new FormControl('', [Validators.required, passwordValidator])
        }, {
            validator: passwordMatchValidator
        });

        this.route.queryParams.subscribe(params => {
            this.errorMessage = undefined;

            if (params['code']) {
                this.headerText = 'Velg passord';
                this.confirmationCode = params['code'];
                this.validateConfirmationCode(this.confirmationCode);
                this.step1Form.disable();
                this.step2Form.enable();
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

        const body = this.step1Form.value;
        body.RecaptchaResponse = this.recaptchaCode;

        this.http.asPOST()
            .usingInitDomain()
            .withEndPoint('sign-up')
            .withBody(body)
            .send()
            .subscribe(
                () => {
                    this.busy = false;
                    this.step1Successful = true;
                    this.headerText = 'E-post sendt';
                },
                err => {
                    this.step1Form.enable();
                    this.busy = false;
                    this.step1Successful = false;
                    if (this.recaptcha) {
                        this.recaptcha.reset();
                    }

                    this.errorMessage = err && err.error && err.error.Message;
                    if (!this.errorMessage) {
                        this.errorMessage = 'Noe gikk galt under verifisering. Vennligst sjekk detaljer og prøv igjen.';
                    }
                },
                () => {
                    if (theme.theme === THEMES.EXT02) {
                        this.celebrusService.useDataLayer('productView', null,
                            [this.getCelebrusObject('step1', this.step1Successful ? 'signup-step' : 'signup-step-fail')]);
                    }
                }
            );
    }

    public submitStep2Form() {
        if (this.busy) {
            return;
        }

        if (!this.step2Form.valid) {
            this.errorMessage = 'Skjemaet er ikke gyldig. Vennligst påse at alle felter er fylt ut i henhold til kravene.';

            this.step2Form.controls.Password.markAsTouched();
            this.step2Form.controls.ConfirmPassword.markAsTouched();

            if (theme.theme === THEMES.EXT02) {
                this.celebrusService.useDataLayer('productView', null, [this.getCelebrusObject('step2', 'signup-step-form-fail')]);
            }
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
                () => {
                    this.step2Successful = true;
                    this.headerText = 'Brukerregistrering fullført';
                },
                err => {
                    this.busy = false;
                    this.step2Successful = false;
                    let errorMessage;

                    try {
                        const errorBody = err.error;
                        errorMessage = errorBody.Message || errorBody.Messages[0].Message;
                    } catch (error) {}

                    this.errorMessage = errorMessage || 'Noe gikk galt under registrering, vennligst prøv igjen';
                },
                () => {
                    if (theme.theme === THEMES.EXT02) {
                        this.celebrusService.useDataLayer('productView', null,
                            [this.getCelebrusObject('step2', this.step2Successful ? 'signup-step' : 'signup-step-fail')]);
                    }
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

    getCelebrusObject(step: string, type: string) {
        return {
            application: 'dnb-regnskap',
            name: 'dnb-regnskap-signup',
            step,
            type
        };
    }
}
