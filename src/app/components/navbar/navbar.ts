import {Component, AfterViewInit} from 'angular2/core';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';
import {Routes, APP_ROUTES} from '../../route.config';

import {HamburgerMenu} from './hamburgerMenu/hamburgerMenu';
import {Tabstrip} from './tabstrip/tabstrip';
import {NavbarSearch} from './search/search';
import {UserDropdown} from './userInfo/userDropdown/userDropdown';
import {CompanyDropdown} from './userInfo/companyDropdown/companyDropdown';

@Component({
	selector: 'uni-navbar',
	templateUrl: 'app/components/navbar/navbar.html',
	directives: [ROUTER_DIRECTIVES, HamburgerMenu, Tabstrip, NavbarSearch, UserDropdown, CompanyDropdown]
})
export class Navbar implements AfterViewInit {
	public routes = Routes;
	
	constructor() {
	}
	
	ngAfterViewInit() {}
}