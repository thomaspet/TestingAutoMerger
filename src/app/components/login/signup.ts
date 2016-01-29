import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';

@Component({
    selector: 'uni-signup',
    templateUrl: 'app/components/login/signup.html',
    directives: [ROUTER_DIRECTIVES]
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
    
    signUp(event) {
        event.preventDefault();
        // post @ api
        // authenticate
        console.log(this.newUser);
    }
}