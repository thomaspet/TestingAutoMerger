/// <reference path="../../kendo/typescript/kendo.all.d.ts" />
import {Component} from 'angular2/angular2';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';
import {Routes, APP_ROUTES} from './route.config';
import {UniRouterOutlet} from './uniRouterOutlet';

import {Navbar} from './components/navbar/navbar';

@Component({
    selector: 'uni-app',
    templateUrl: './app/app.html',
    directives: [ROUTER_DIRECTIVES, UniRouterOutlet, Navbar]
})
@RouteConfig(APP_ROUTES)
export class App {
    public routes = Routes;
    
    loggedIn(): boolean {
        var token = localStorage.getItem('jwt');
        return (token !== null);
    }
  
}