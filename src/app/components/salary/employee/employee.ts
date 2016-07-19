import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';

@Component({
    template:'<router-outlet></router-outlet>',
    selector: 'uni-employee',
    directives: [ROUTER_DIRECTIVES]
})
export class UniEmployee {
    constructor(){
        console.log("EMployee");
    }
}
