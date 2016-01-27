import {Component} from 'angular2/core';

@Component({
    selector: 'uni-signup',
    templateUrl: 'app/components/login/signup.html'
})
export class Signup {
    newUser: { 
        companyName: string,
        name: string,
        email: string,
        username: string,
        password: string    
    }
    
    constructor() {
        this.newUser = {
            companyName: '',
            name: '',
            email: '',
            username: '',
            password: ''
        }
    }
    
    signup() {
        // post @ api
        // authenticate
        console.log(this.newUser);
    }
}