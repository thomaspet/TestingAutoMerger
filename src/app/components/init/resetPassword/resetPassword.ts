import {Component} from '@angular/core';
import {ActivatedRoute, ROUTER_DIRECTIVES} from '@angular/router';
import {Control, Validators, ControlGroup, FORM_DIRECTIVES} from '@angular/common';
import {passwordValidator} from '../authValidators';
import {UniHttp} from '../../../../framework/core/http/http';

@Component({
    selector: 'uni-reset-password',
    templateUrl: 'app/components/init/resetPassword/resetPassword.html',
    directives: [FORM_DIRECTIVES, ROUTER_DIRECTIVES],
})
export class ResetPassword {
    private code: string;
    private userid: string;
        
    private busy: boolean = false;
    private emailSent: boolean = false;
    private passwordChanged: boolean = false;
    private passwordsMatch: boolean = false;
    
    private successMessage: string = '';
    private errorMessage: string = '';
    private emailForm: ControlGroup;
    private passwordForm: ControlGroup;
    
    constructor(private route: ActivatedRoute, private uniHttp: UniHttp) {
        this.route.params.subscribe(params => {
            this.code = params['code'];
            this.userid = params['userid'];       
        });
        
        var validator = Validators.compose([
            passwordValidator,
            Validators.required,
            Validators.minLength(8), 
            Validators.maxLength(16)
        ]);
                
        this.emailForm = new ControlGroup({
            email: new Control('', Validators.required)
        });
    
        let passwordCtrl = new Control('', validator);
        let confirmPasswordCtrl = new Control('', validator);
        
        // TODO: This should be handled through a validator!
        passwordCtrl.valueChanges.subscribe((value) => {
            this.passwordsMatch = (value === confirmPasswordCtrl.value);
            console.log(this.passwordsMatch);
        });
        confirmPasswordCtrl.valueChanges.subscribe((value) => {
            this.passwordsMatch = (value === passwordCtrl.value);
            console.log(this.passwordsMatch);
        });
        
        this.passwordForm = new ControlGroup({
            password: passwordCtrl,
            confirmPassword: confirmPasswordCtrl
        });        
        
    }
        
    private sendResetEmail() {
        this.busy = true;
        this.errorMessage = '';
        this.successMessage = '';
        
        this.uniHttp.asPOST()
            .usingInitDomain()
            .withEndPoint('forgot-password')
            .withBody({'email': this.emailForm.controls['email'].value})
            .send({}, true)           
            .subscribe(
                (response) => {
                    if (response.status === 200) {
                        this.successMessage = 'Vennligst sjekk epost innboksen din for videre instrukser';
                        this.busy = false;
                        this.emailSent = true;
                    }
                },
                (error) => {
                    if (error.status === 404) {
                        this.errorMessage = 'Vi klarte ikke finne en aktiv bruker. Er epost korrekt?';
                    }
                    this.busy = false;
                }
            );
    }
    
    private resetPassword() {
        this.busy = true;
        this.errorMessage = '';
        this.successMessage = '';   
        
        this.uniHttp.asPOST()
            .usingInitDomain()
            .withEndPoint('reset-password')
            .withBody({
                newpassword: this.passwordForm.controls['password'].value,
                resetpasswordcode: decodeURIComponent(this.code),
                userid: decodeURIComponent(this.userid)
            })
            .send({}, true)
            .subscribe(
                (response) => {
                    if (response.status === 200) {
                        this.passwordChanged = true;
                        this.busy = false;
                    }
                },
                (error) => {
                    this.busy = false;
                    this.errorMessage = 'Noe gikk galt. Vennligst prøv igjen';
                }
            );
                        
    }
}
