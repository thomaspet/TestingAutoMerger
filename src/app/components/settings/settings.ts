import {Component, OnInit} from 'angular2/core';
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, RouterLink, Router} from 'angular2/router';
import {CompanySettings} from './settingsComponents/companySettings';
import {UserSettings} from './settingsComponents/userSettings';

const CHILD_ROUTES = [
    { path: '/', component: CompanySettings, as: 'CompanySettings' },
    { path: '/company', component: CompanySettings, as: 'CompanySettings' },
    { path: '/user', component: UserSettings, as: 'UserSettings' }
];

@Component({
    selector: 'settings',
    templateUrl: 'app/components/settings/settings.html',
    directives: [ROUTER_DIRECTIVES]
})

@RouteConfig(CHILD_ROUTES)
export class Settings {
    
    childRoutes: RouteDefinition[];

    constructor(public router: Router) {

        this.childRoutes = CHILD_ROUTES;

    }
}