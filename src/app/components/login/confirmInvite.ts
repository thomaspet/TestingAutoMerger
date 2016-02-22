import {Component} from 'angular2/core';
import {Router, RouteParams} from 'angular2/router';
import {NgIf, NgClass} from 'angular2/common';
import {UniHttpService, IUniHttpRequest} from '../../../framework/data/uniHttpService';
import {Http, URLSearchParams, Headers} from 'angular2/http';

@Component({
    selector: 'uni-confirm-invite',
    templateUrl: 'app/components/login/confirmInvite.html',
    directives: [NgIf, NgClass]
})

export class Confirm {

    user;
    id: number;
    passwordRepeat = { password: '' };
    isInvalidPasswords: boolean = false;
    isPasswordMismatch: boolean = false;
    isInvalidUsername: boolean = false;
    validInvite: boolean = true;
    working: boolean = false;
    formErrorMessage: string;
    verificationCodeErrorMessage: string;

    constructor(private uniHttp: UniHttpService, private param: RouteParams, private http: Http, private router: Router) {
        this.user = {};
        if (param.get('guid')) {
            this.user['verification-code'] = param.get('guid');
            var filter = "VerificationCode eq " + "'" + this.user['verification-code'] + "'";

            //ROUTE WILL BE CHANGED
            uniHttp.get({ resource: 'user-verifications', filter: filter })
                .subscribe(
                (data) => {
                    console.log(data);
                    if (data[0].ExpirationDate) {
                        if (new Date(data[0].ExpirationDate) > new Date()) {
                            this.validInvite = true;
                            this.id = data[0].ID;
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

    confirmUser() {

        //PUT USER
        if (this.isValidUser()) {
            this.working = true;
            var headers = new Headers();
            headers.append("Client", "client1");

            var urlParams = new URLSearchParams();
            urlParams.append('verification-code', this.user['verification-code']);
            urlParams.append('user-name', this.user['user-name']);
            urlParams.append('password', this.user.password);
            urlParams.append('action', 'confirm-invite');

            this.http.put('http://devapi.unieconomy.no:80/api/biz/user-verifications', null,
                { headers: headers, search: urlParams }
            ).subscribe(
                (data) => {
                    this.working = false;
                    this.router.navigateByUrl('/login');
                },
                (error) => { this.formErrorMessage = 'Noe gikk galt ved registrering. Prøv igjen'; })
        }
    }

    isValidUser() {
        this.formErrorMessage = '';

        //Username should not be empty or undefined
        if (this.user['user-name'] === undefined || this.user['user-name'] === '') {
            this.formErrorMessage += 'Ugyldig brukernavn..';
            this.isInvalidUsername = true;
        } else { this.isInvalidUsername = false; }

        //Passwords should have 8-16 characters and should contain big and small numbers, and at least 1 number
        if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/g.test(this.user.password)) {
            this.formErrorMessage += ' Passord må være mellom 8-16 tegn, store og små bokstaver og minst 1 tall';
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