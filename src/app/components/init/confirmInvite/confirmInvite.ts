import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FormControl, Validators, FormGroup, FormBuilder} from '@angular/forms';
import {UniHttp} from '../../../../framework/core/http/http';
import {passwordValidator, passwordMatchValidator, usernameValidator} from '../authValidators';
import {Logger} from '../../../../framework/core/logger';

@Component({
    selector: 'uni-confirm-invite',
    templateUrl: './confirmInvite.html'
})
export class ConfirmInvite {
    private confirmInviteForm: FormGroup;
    private errorMessage: string;
    private validInvite: boolean = false;
    private busy: boolean = false;

    private verificationCode: string;

    constructor(
        private uniHttp: UniHttp,
        private route: ActivatedRoute,
        private router: Router,
        private logger: Logger,
        formBuilder: FormBuilder
    ) {
        this.route.params.subscribe(params => {
            this.verificationCode = params['guid'];

            this.confirmInviteForm = formBuilder.group({
                Name: new FormControl('', Validators.required),
                UserName: new FormControl('', [Validators.required, usernameValidator]),
                Password: new FormControl('', [Validators.required, passwordValidator]),
                ConfirmPassword: new FormControl('', [Validators.required, passwordValidator])
            }, {
                validator: passwordMatchValidator
            });

            if (this.verificationCode) {
                this.validInvite = true;

                // Gets the full user-verification object to check that it's valid
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
                                this.confirmInviteForm.disable();
                            }
                        },
                        (error) => {
                            this.errorMessage = 'Invitasjonen er ikke gyldig. Vennligst be administrator invitere deg på nytt.'
                            this.confirmInviteForm.disable();
                        }
                    );
            } else {
                this.confirmInviteForm.disable();
            }
        });
    }

    public submitUser() {
        this.busy = true;
        this.confirmInviteForm.disable();

        this.uniHttp.asPUT()
            .usingInitDomain()
            .withEndPoint('user-verification/' + this.verificationCode + '/')
            .withHeader('Content-Type', 'application/json')
            .withBody(this.confirmInviteForm.value)
            .send({action: 'confirm-invite'})
            .map(response => response.json())
            .subscribe(
                (data) => {
                    this.busy = false;
                    this.router.navigateByUrl('/login');
                    this.confirmInviteForm.enable();
                },
                (error) => {
                    this.busy = false;
                    this.confirmInviteForm.enable();
                    this.errorMessage = 'Noe gikk galt ved oppretting av bruker, vennligst prøv igjen.';
                    try {
                        let messages = JSON.parse(error._body).Messages;
                        if (messages.length) {
                            messages.forEach(element => {
                                if ( element.PropertyName === 'UserName'
                                && (element.Message === 'Username must be unique')) {
                                    this.errorMessage = 'Brukernavnet finnes allerede. Vennligst prøv igjen.';
                                }
                            });
                        }
                    } catch (e) {}

                    this.logger.exception(error);
                }
            );
    }
}
