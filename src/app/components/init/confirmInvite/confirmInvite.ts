import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FormControl, Validators, FormGroup} from '@angular/forms';
import {UniHttp} from '../../../../framework/core/http/http';
import {passwordValidator} from '../authValidators';
import {Logger} from '../../../../framework/core/logger';

@Component({
    selector: 'uni-confirm-invite',
    templateUrl: './confirmInvite.html'
})

export class ConfirmInvite {
    private confirmInviteForm: FormGroup;
    private errorMessage: string = '';
    private validInvite: boolean = false;
    private busy: boolean = false;

    private verificationCode: string;
    private invalidUsernameMsg: string;
    private passwordMismatch: boolean;

    constructor(
        private uniHttp: UniHttp,
        private route: ActivatedRoute,
        private router: Router,
        private logger: Logger
    ) {
        this.route.params.subscribe(params => {
            this.verificationCode = params['guid'];

            let passwordValidators = Validators.compose([
                passwordValidator,
                Validators.required,
                Validators.minLength(8),
                Validators.maxLength(16)
            ]);

            let userNameValidators = Validators.compose([
                (control) => this.usernameValidator(control),
                Validators.required
            ]);

            this.confirmInviteForm = new FormGroup({
                displayName: new FormControl('', Validators.required),
                username: new FormControl('', userNameValidators),
                password: new FormControl('', passwordValidators),
                confirmPassword: new FormControl('', passwordValidators)
            });

            this.confirmInviteForm.controls['password'].valueChanges
                .subscribe(change => this.checkForPasswordMismatch());

            this.confirmInviteForm.controls['confirmPassword'].valueChanges
                .subscribe(change => this.checkForPasswordMismatch());

            if (this.verificationCode) {
                // Gets the full user-verification object to see if it is valid
                this.uniHttp.asGET()
                    .usingInitDomain()
                    .withEndPoint('user-verification/' + this.verificationCode)
                    .send()
                    .map(response => response.json())
                    .subscribe(
                        (response) => {
                            if (response.StatusCode === 0 && response.ExpirationDate && Date.parse(response.ExpirationDate) > Date.now()) {
                                this.validInvite = true;
                            } else {
                                this.errorMessage = 'Invitasjonen har utgått eller er ikke gyldig. Vennligst be administrator invitere deg på nytt.'
                            }
                        },
                        (error) => {
                            this.errorMessage = 'Invitasjonen er ikke gyldig. Vennligst be administrator invitere deg på nytt.'
                        }
                    );
            }
        });
    }

    private checkForPasswordMismatch() {
        const p1 = this.confirmInviteForm.controls['password'];
        const p2 = this.confirmInviteForm.controls['confirmPassword'];

        // Dont validate password match before both are valid to avoid spamming the user
        this.passwordMismatch = p1.valid && p2.valid && p1.value !== p2.value;
    }

    public submitUser() {
        const displayName = this.confirmInviteForm.controls['displayName'].value;
        const username = this.confirmInviteForm.controls['username'].value;
        const password = this.confirmInviteForm.controls['password'].value;

        this.busy = true;

        this.uniHttp.asPUT()
            .usingInitDomain()
            .withEndPoint('user-verification/' + this.verificationCode + '/')
            .withHeader('Content-Type', 'application/json')
            .withBody({Name: displayName, UserName: username, Password: password})
            .send({action: 'confirm-invite'})
            .map(response => response.json())
            .subscribe(
                (data) => {
                    this.busy = false;
                    this.router.navigateByUrl('/login');
                },
                (error) => {
                    this.errorMessage = 'Noe gikk galt ved verifiseringen. Vennligst prøv igjen';
                    try {
                        let messages = JSON.parse(error._body).Messages;
                        if (messages.length) {
                            messages.forEach(element => {
                                if ( element.PropertyName === 'UserName'
                                && (element.Message === 'Username must be unique')){
                                    this.errorMessage = 'Brukernavnet er ikke unikt. Vennligst velg et annet';
                                }
                            });
                        }
                    } catch (e) {}

                    this.busy = false;
                    this.logger.exception(error);
                }
            );
    }

    private usernameValidator(control) {
        const invalid = /[^a-zæøåA-ZÆØÅ]/g.test(control.value);
        if (invalid) {
            this.invalidUsernameMsg = 'Brukernavn kan kun inneholde bokstaver';
            return {'usernameValidator': true};
        } else {
            this.invalidUsernameMsg = '';
            return null;
        }
    }
}
