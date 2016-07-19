﻿import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {NgIf, NgClass, ControlGroup, Control, Validators} from '@angular/common';
import {UniHttp} from '../../../../framework/core/http/http';
import {passwordValidator} from '../authValidators';

@Component({
    selector: 'uni-confirm-invite',
    templateUrl: 'app/components/init/confirmInvite/confirmInvite.html',
    directives: [NgIf, NgClass]
})

export class ConfirmInvite {    
    private confirmInviteForm: ControlGroup;
    private passwordsMatching: boolean = false;
    private errorMessage: string = '';
    private validInvite: boolean = false;
    private busy: boolean = false;

    private verificationCode: string;


    constructor(private uniHttp: UniHttp, private route: ActivatedRoute, private router: Router) {
        this.route.params.subscribe(params => {
            this.verificationCode = params['guid'];

            let passwordValidators = Validators.compose([
                passwordValidator,
                Validators.required,
                Validators.minLength(8),
                Validators.maxLength(16)
            ]);

            this.confirmInviteForm = new ControlGroup({
                username: new Control('', Validators.required),
                password: new Control('', passwordValidators),
                confirmPassword: new Control('', passwordValidators)
            });

            this.confirmInviteForm.controls['password'].valueChanges.subscribe((value) => {
                this.passwordsMatching = (value === this.confirmInviteForm.controls['confirmPassword'].value);
            });

            this.confirmInviteForm.controls['confirmPassword'].valueChanges.subscribe((value) => {
                this.passwordsMatching = (value === this.confirmInviteForm.controls['password'].value);
            });

            if (this.verificationCode) {
                // Gets the full user-verification object to see if it is valid
                this.uniHttp.asGET()
                    .usingInitDomain()
                    .withEndPoint('user-verification/' + this.verificationCode)
                    .send()
                    .subscribe(
                        (response) => {
                            if (response.StatusCode === 0 && response.ExpirationDate && Date.parse(response.ExpirationDate) > Date.now()) {
                                this.validInvite = true;
                            } else {
                                this.errorMessage = 'Invitasjonen har utgått eller er ikke gyldig. Vennligst be administrator invitere deg på nytt.'
                            }
                        },
                        (error) => {
                            this.errorMessage = 'Invitasjonen har utgått eller er ikke gyldig. Vennligst be administrator invitere deg på nytt.'
                        }
                    );
            }
        });
    }

    private submitUser() {       
        const username = this.confirmInviteForm.controls['username'].value;
        const password = this.confirmInviteForm.controls['password'].value;
        
        this.busy = true;     

        this.uniHttp.asPUT()
            .usingInitDomain()
            .withEndPoint('user-verification/' + this.verificationCode + '/')
            .withHeader('Content-Type', 'application/json')
            .withBody({UserName: username, Password: password})
            .send({action: 'confirm-invite'})
            .subscribe(
                (data) => {
                    this.busy = false;
                    this.router.navigateByUrl('/login');
                },
                (error) => {
                    this.errorMessage = 'Noe gikk galt ved verifiseringen. Vennligst prøv igjen';
                    try {
                        let modelState = JSON.parse(error.json().Message).modelState;
                        if (modelState[''][0].length) {
                            this.errorMessage = modelState[''][0]
                        }
                    } catch (e) {}
                    
                    this.busy = false;
                }
            );
    }
}
