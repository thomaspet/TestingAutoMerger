import {Component} from 'angular2/core';
import {Router, RouteParams} from 'angular2/router';
import {NgIf, NgClass} from 'angular2/common';
import {UniHttpService, UniHttpRequest} from '../../../framework/data/uniHttpService';

@Component({
    selector: 'uni-confirm-invite',
    templateUrl: 'app/components/login/confirmInvite.html',
    directives: [NgIf, NgClass]
})

export class Confirm {

    user;
    id: number;
    passwordRepeat = { password: '' };
    isPasswordsMismatch: boolean = false;
    isInvalidUsername: boolean = false;
    validVerificationCode: boolean = false;
    validInvite: boolean = true;
    working: boolean = false;
    formErrorMessage: string;
    verificationCodeErrorMessage: string;

    constructor(private http: UniHttpService, private param: RouteParams) {
        this.user = {};
        if (param.get('guid')) {
            this.user['verification-code'] = param.get('guid');
            var filter = "VerificationCode eq " + "'" + this.user['verification-code'] + "'";

            http.get({ resource: 'user-verifications', filter: filter })
                .subscribe(
                (data) => {
                    if (data[0].ExpirationDate) {
                        if (new Date(data[0].ExpirationDate) > new Date()) {
                            this.validVerificationCode = true;
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
            //Error handling
        }
    }

    confirmUser() {

        //PUT USER
        if (this.isvalidUser()) {
            this.working = true;
            console.log(this.user);

            this.http.put(
                {
                    resource: 'user-verifications/' + this.id,
                    body: this.user,
                    action: 'confirm-invite'
                }
            ).subscribe(
                (data) => {
                    this.working = false;
                    console.log(data);
                },
                //Error handling
                error => console.log(error)
            )
        }
    }

    isvalidUser() {
        this.formErrorMessage = '';
        if (this.user['user-name'] === undefined || this.user['user-name'] === '') {
            this.formErrorMessage += 'Ugyldig brukernavn..';
            this.isInvalidUsername = true;
        } else { this.isInvalidUsername = false; }

        if (this.passwordRepeat.password === '' || this.user.password === '' || (this.user.password !== this.passwordRepeat.password)) {
            this.formErrorMessage += ' Ugyldige passord..';
            this.isPasswordsMismatch = true;
        } else { this.isPasswordsMismatch = false; }

        return (!this.isInvalidUsername && !this.isPasswordsMismatch);
    }
}