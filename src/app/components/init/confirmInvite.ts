import {Component} from '@angular/core';
import {Router, RouteParams} from '@angular/router-deprecated';
import {NgIf, NgClass, ControlGroup, Control, Validators} from '@angular/common';
import {UniHttp} from '../../../framework/core/http/http';
import {passwordValidator} from './authValidators';

@Component({
    selector: 'uni-confirm-invite',
    templateUrl: 'app/components/init/confirmInvite.html',
    directives: [NgIf, NgClass]
})

export class ConfirmInvite {    
    private confirmInviteForm: ControlGroup;
    private passwordsMatching: boolean = false;
    private errorMessage: string = '';
    private validInvite: boolean = false;
    private isWorking: boolean = false;

    private verificationCode: string;

    private isError: boolean = false;
    private working: boolean = false;
    private formErrorMessage: string;
    
    
    private verificationCodeErrorMessage: string = '';

    constructor(private uniHttp: UniHttp, private routeParams: RouteParams, private router: Router) {
        this.verificationCode = routeParams.get('guid');
        
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
            //Gets the full user-verification object to see if it is valid
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
    }

    //Put to user-verification to confirm user
    private submitUser() {       
        const username = this.confirmInviteForm.controls['username'].value;
        const password = this.confirmInviteForm.controls['password'].value;
        
        this.isWorking = true;     
        
        this.uniHttp.asPUT()
            .usingInitDomain()
            .withEndPoint('user-verification/' + this.verificationCode + '/')
            .withHeader('Content-Type', 'application/json')
            .withBody({UserName: username, Password: password})
            .send({action: 'confirm-invite'})
            .subscribe(
                (data) => {
                    this.isWorking = false;
                    this.router.navigateByUrl('/login');
                },
                (error) => {
                    this.errorMessage = 'Noe gikk galt ved verifiseringen. Vennligst prøv igjen';
                    this.isWorking = false;
                }
            );
    }
}