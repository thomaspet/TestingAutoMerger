import {Component} from 'angular2/core';
import {Router, RouteParams} from 'angular2/router';
import {UniHttpService, UniHttpRequest} from '../../../framework/data/uniHttpService';

@Component({
    selector: 'uni-confirm-invite',
    templateUrl: 'app/components/login/confirmInvite.html'
})

export class Confirm {

    user = { Username: '', Password: '', VerificationCode: '' };
    passwordRepeat = { password: '' };
    isPasswordsMismatch: boolean = false;
    isInvalidUsername: boolean = false;
    working: boolean = false;
    errorMessage: string;

    constructor(private http: UniHttpService, private param: RouteParams) {

        if (param.get('guid')) {
            this.user.VerificationCode = param.get('guid');
            
            //Check that invite exists and is still valid
            //Status not implemented yet

        } else {
            //Error handling
        }
    }

    confirmUser() {

        //PUT USER
        if (this.isvalidUser()) {
            this.working = true;
            this.isPasswordsMismatch = false;
            this.isInvalidUsername = false;
            console.log(this.user);

            this.http.put(
                {
                    resource: '/users',
                    body: this.user,
                    action: 'confirm-invite'
                }
            ).subscribe(
                (data) => {
                    console.log(data);
                },
                //Error handling
                error => console.log(error)
            )
        }

        
    }

    isvalidUser() {
        this.errorMessage = '';
        var valid = true;

        if (this.user.Username === '') {
            this.errorMessage += 'Ugyldig brukernavn..';
            this.isInvalidUsername = true;
            valid = false;
        } else { this.isInvalidUsername = false; }

        if (this.passwordRepeat.password === '' || this.user.Password === '' || (this.user.Password !== this.passwordRepeat.password)) {
            this.errorMessage += ' Ugyldige passord..';
            this.isPasswordsMismatch = true;
            valid = false;
        } else { this.isPasswordsMismatch = false; }

        return valid;
    }
}