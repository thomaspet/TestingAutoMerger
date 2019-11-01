import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FormControl, Validators, FormGroup, FormBuilder} from '@angular/forms';
import {UniHttp} from '@uni-framework/core/http/http';
import {passwordValidator, passwordMatchValidator} from '../authValidators';

@Component({
    selector: 'uni-confirm-invite',
    templateUrl: './confirmInvite.html'
})
export class ConfirmInvite {
    confirmInviteForm: FormGroup;
    errorMessage: string;
    validInvite: boolean = false;
    busy: boolean = false;

    private verificationCode: string;

    constructor(
        private uniHttp: UniHttp,
        private route: ActivatedRoute,
        private router: Router,
        formBuilder: FormBuilder
    ) {
        this.route.params.subscribe(params => {
            this.verificationCode = params['guid'];

            this.confirmInviteForm = formBuilder.group({
                Name: new FormControl('', Validators.required),
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
                    .map(response => response.body)
                    .subscribe(
                        (response) => {
                            if (response.StatusCode === 0
                                && response.ExpirationDate
                                && Date.parse(response.ExpirationDate) > Date.now()
                            ) {
                                this.validInvite = true;
                            } else {
                                this.errorMessage = 'Invitasjonen har utgått eller er ikke gyldig. '
                                    + 'Vennligst be administrator invitere deg på nytt.';
                                this.confirmInviteForm.disable();
                            }
                        },
                        () => {
                            this.errorMessage = 'Invitasjonen er ikke gyldig. Vennligst be administrator invitere deg på nytt.';
                            this.confirmInviteForm.disable();
                        }
                    );
            } else {
                this.confirmInviteForm.disable();
            }
        });
    }

    submitUser() {
        this.busy = true;
        this.confirmInviteForm.disable();

        this.uniHttp.asPUT()
            .usingInitDomain()
            .withEndPoint('user-verification/' + this.verificationCode + '/')
            .withHeader('Content-Type', 'application/json')
            .withBody(this.confirmInviteForm.value)
            .send({action: 'confirm-invite'})
            .map(response => response.body)
            .subscribe(
                () => {
                    this.busy = false;
                    this.router.navigateByUrl('/login');
                    this.confirmInviteForm.enable();
                },
                () => {
                    this.busy = false;
                    this.confirmInviteForm.enable();
                    this.errorMessage = 'Noe gikk galt ved oppretting av bruker, vennligst prøv igjen.';
                }
            );
    }
}
