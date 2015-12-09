import {Component, AfterViewInit} from 'angular2/angular2';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';
import {Routes, APP_ROUTES} from '../../../route.config';

@Component({
	selector: 'uni-tabstrip',
	templateUrl: 'app/components/navbar/tabstrip/tabstrip.html',
	directives: [ROUTER_DIRECTIVES]
})
export class Tabstrip implements AfterViewInit {
	public routes = Routes;
	
	constructor() {}
	
	ngAfterViewInit() {}
}