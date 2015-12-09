import {Component, AfterViewInit} from 'angular2/angular2';
import {UserDropdown} from './userInfo/user/userDropdown'

// Todo: check if some of these are not needed
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';
import {Routes, APP_ROUTES} from '../../route.config';
import {UniRouterOutlet} from '../../uniRouterOutlet';

@Component({
	selector: 'uni-navbar',
	templateUrl: 'app/components/navbar/navbar.html',
	directives: [ROUTER_DIRECTIVES, UniRouterOutlet, UserDropdown]
})
export class Navbar implements AfterViewInit {
	public routes = Routes;
	constructor() {
	}
	
	ngAfterViewInit() {}
}