/// <reference path="../../kendo/typescript/kendo.all.d.ts" />
/// <reference path="../../typings/main.d.ts" />

import {Component} from 'angular2/core';
import {Router, RouteConfig, ROUTER_DIRECTIVES, AsyncRoute} from 'angular2/router';
import {Routes} from './route.config';
import {UniRouterOutlet} from './uniRouterOutlet';
import {AuthService} from '../framework/core/authService';
import {TabService} from './components/layout/navbar/tabstrip/tabService';
import {UniNavbar} from './components/layout/navbar/navbar';
import {UniHttp} from '../framework/core/http/http';
import {StaticRegisterService} from './services/staticregisterservice';

@Component({
    selector: 'uni-app',
    templateUrl: './app/app.html',
    directives: [ROUTER_DIRECTIVES, UniRouterOutlet, UniNavbar],
    providers: [AuthService, TabService, UniHttp, StaticRegisterService]
})
@RouteConfig(Routes)
export class App {
    public routes: AsyncRoute[] = Routes;

    constructor(private authService: AuthService, router: Router) {}

}
