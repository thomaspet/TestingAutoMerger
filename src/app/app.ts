/// <reference path="../../kendo/typescript/kendo.all.d.ts" />
import {Component} from 'angular2/core';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';
import {Routes, APP_ROUTES} from './route.config';
import {UniRouterOutlet} from './uniRouterOutlet';
import {AuthService} from '../framework/authentication/authService';
import {TabService} from './components/navbar/tabstrip/tabService';
import {Navbar} from './components/navbar/navbar';
import {UniHttpService} from '../framework/data/uniHttpService';

@Component({
	selector: 'uni-app',
	templateUrl: './app/app.html',
	directives: [ROUTER_DIRECTIVES, UniRouterOutlet, Navbar],
	providers: [AuthService, TabService, UniHttpService]
})
@RouteConfig(APP_ROUTES)
export class App {
	public routes = Routes;
		
	constructor(private authService: AuthService) {}
	
}
