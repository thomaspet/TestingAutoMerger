import {Component, AfterViewInit} from 'angular2/angular2';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';
import {Routes, APP_ROUTES} from '../../../route.config';
declare var jQuery;

@Component({
	selector: 'uni-hamburger-menu',
	templateUrl: 'app/components/navbar/hamburgerMenu/hamburgerMenu.html',
	directives: [ROUTER_DIRECTIVES]
})
export class HamburgerMenu implements AfterViewInit {
    public routes = Routes;
	
    constructor() {
        jQuery('.listElement').mouseover(function (e) {
            jQuery(this).addClass('is-active');
            jQuery(this).siblings().removeClass('is-active');
        });
    }

    openBurgerMenu(): void {
        jQuery('.navbar_hamburger').toggleClass('is-active');
    }

	ngAfterViewInit() {}
}