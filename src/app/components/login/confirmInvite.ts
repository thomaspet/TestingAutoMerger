import {Component} from 'angular2/core';
import {Router, RouteParams} from 'angular2/router';
import {NgIf, NgClass} from 'angular2/common';
import {UniHttp} from '../../../framework/core/http';

@Component({
    selector: 'uni-confirm-invite',
    templateUrl: 'app/components/login/confirmInvite.html',
    directives: [NgIf, NgClass]
})

export class Confirm {

    user;
    verificationCode: string;
    passwordRepeat = { password: '' };
    isInvalidPasswords: boolean = false;
    isPasswordMismatch: boolean = false;
    isInvalidUsername: boolean = false;
    isError: boolean = false;
    validInvite: boolean = true;
    working: boolean = false;
    formErrorMessage: string;
    verificationCodeErrorMessage: string;

    constructor(private uniHttp: UniHttp, private param: RouteParams, private router: Router) {
        this.user = {};
        if (param.get('guid')) {
            this.verificationCode = param.get('guid');

            //Gets the full user-verification object to see if it is valid
            this.uniHttp
                .asGET()
                .usingInitDomain()
                .withEndPoint('user-verification/' + this.verificationCode)
                .send()
                .subscribe(
                (data) => {

                    //Checks that the verifcationobject is valid and is not already confirmed
                    if (data.ExpirationDate && data.StatusCode === 0) {
                        if (new Date(data.ExpirationDate) > new Date()) {
                            this.validInvite = true;
                        } else {
                            this.verificationCodeErrorMessage = 'Denne invitasjonen har utgått og er ikke lenger gyldig..'
                            this.validInvite = false;
                        } 
                    } else {
                        this.verificationCodeErrorMessage = 'Dette er ikke en gyldig kode.'
                        this.validInvite = false;
                    }
                },
                (error) => {
                    this.verificationCodeErrorMessage = 'Dette er ikke en gyldig kode.'
                    this.validInvite = false;
                }
            )

        } else {
            //If this happends, the application crashed because the Router requries id..
        }
    }

    //Put to user-verification to confirm user
    confirmUser() {
        this.formErrorMessage = '';
        this.isError = false; 
        if (this.isValidUser()) {
            this.working = true;
            console.log(this.user);
            this.uniHttp
                .asPUT()
                .usingInitDomain()
                .withEndPoint('user-verification/' + this.verificationCode + '/')
                .withHeader('Content-Type', 'application/json')
                .withBody(this.user)
                .send({ action: 'confirm-invite' })
                .subscribe(
                (data) => {
                    this.working = false;
                    this.router.navigateByUrl('/login');
                },
                (error) => {
                    this.formErrorMessage = 'Noe gikk galt ved verifiseringen. Prøv igjen';
                    this.isError = true;
                    this.working = false;
                }
                )
        }
    }

    //Checks if form input fields are all valid
    isValidUser() {
        //Username should not be empty or undefined
        if (this.user.username === undefined || this.user.username === '') {
            this.formErrorMessage += 'Ugyldig brukernavn..';
            this.isInvalidUsername = true;
        } else { this.isInvalidUsername = false; }

        //Passwords should have 8-16 characters and should contain big and small letters, and at least 1 number
        if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/g.test(this.user.password)) {
            this.formErrorMessage += ' Passord må være mellom 8-16 tegn, store og små bokstaver og minst 1 tall..';
            this.isInvalidPasswords = true;
        } else { this.isInvalidPasswords = false; }

        //Passwords should not be empty, and should match
        if (this.passwordRepeat.password === '' || this.user.password === '' || (this.user.password !== this.passwordRepeat.password)) {
            this.formErrorMessage += ' Ulike passord..';
            this.isPasswordMismatch = true;
        } else { this.isPasswordMismatch = false; }

        return (!this.isInvalidUsername && !this.isInvalidPasswords && !this.isPasswordMismatch);
    }
}