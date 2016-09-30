import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from "@angular/router";

@Component({
    selector: 'uni-dimensions',
    template: '<router-outlet></router-outlet>',
    directives: [ROUTER_DIRECTIVES]
})
export class UniDimensions {}
