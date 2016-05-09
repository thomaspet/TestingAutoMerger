/// <reference path="../../kendo/typescript/kendo.all.d.ts" />
/// <reference path="../../typings/main.d.ts" />

import {Component} from '@angular/core';
import {Router, RouteConfig, ROUTER_DIRECTIVES, AsyncRoute} from '@angular/router-deprecated';
import {ROUTES} from './route.config';
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
@RouteConfig(ROUTES)
export class App {
    public routes: AsyncRoute[] = ROUTES;

    constructor(private authService: AuthService, router: Router) {}

}
