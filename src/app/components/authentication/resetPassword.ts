import {Component} from 'angular2/core';
import {RouteParams, ROUTER_DIRECTIVES} from 'angular2/router';
import {Control, Validators, ControlGroup, FORM_DIRECTIVES} from 'angular2/common';
import {passwordValidator} from './authValidators';
import {UniHttp} from '../../../framework/core/http/http';

@Component({
    selector: 'uni-reset-password',
    templateUrl: 'app/components/authentication/resetPassword.html',
    directives: [FORM_DIRECTIVES, ROUTER_DIRECTIVES],
})
export class ResetPassword {
    private code: string;
    private userid: string;
        
    private working: boolean = false;
    private passwordChanged: boolean = false;
    private passwordsMatch: boolean = false;
    
    private successMessage: string = '';
    private errorMessage: string = '';
    private emailForm: ControlGroup;
    private passwordForm: ControlGroup;
    
    constructor(routeParams: RouteParams, private uniHttp: UniHttp) {
        this.code = routeParams.get('code');
        this.userid = routeParams.get('userid');
                
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
        this.working = true;
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
                        this.successMessage = 'Please check your inbox.';
                        this.working = false;
                    }
                },
                (error) => {
                    if (error.status === 404) {
                        this.errorMessage = 'Email not found.';
                    }
                    this.working = false;
                }
            );
    }
    
    private resetPassword() {
        this.working = true;
        this.errorMessage = '';
        this.successMessage = '';   
        
        this.uniHttp.asPOST()
            .usingInitDomain()
            .withEndPoint('reset-password')
            .withBody({
                newpassword: this.passwordForm.controls['password'].value,
                resetpasswordcode: this.code,
                userid: this.userid
            })
            .send({}, true)
            .subscribe(
                (response) => {
                    if (response.status === 200) {
                        this.passwordChanged = true;
                        this.working = false;
                    }
                },
                error => this.errorMessage = 'Something went wrong'
            );
                        
    }
}
