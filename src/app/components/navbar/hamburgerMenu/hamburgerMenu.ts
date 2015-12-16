import {Component, AfterViewInit} from 'angular2/core';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';
import {Routes, APP_ROUTES} from '../../../route.config';

@Component({
	selector: 'uni-hamburger-menu',
	templateUrl: 'app/components/navbar/hamburgerMenu/hamburgerMenu.html',
	directives: [ROUTER_DIRECTIVES]
})
export class HamburgerMenu implements AfterViewInit {
	public routes = Routes;
	
	constructor() {
	}
	
	ngAfterViewInit() {}
}