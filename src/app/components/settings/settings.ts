import {Component, OnInit} from 'angular2/core';
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, RouterLink, Router} from 'angular2/router';
import {CompanySettings} from './settingsComponents/companySettings';
import {UserSettings} from './settingsComponents/userSettings';
import {TabService} from '../navbar/tabstrip/tabService';
import {ApplicationNav} from '../common/applicationNav/applicationNav';

const CHILD_ROUTES = [
    { path: '/company', component: CompanySettings, as: 'Firmainnstillinger' },
    { path: '/user', component: UserSettings, as: 'Brukere og roller' }
];

@Component({
    selector: 'settings',
    templateUrl: 'app/components/settings/settings.html',
    directives: [ROUTER_DIRECTIVES, ApplicationNav]
})

@RouteConfig(CHILD_ROUTES)
export class Settings {
    
    childRoutes: RouteDefinition[];

    constructor(public router: Router, private tabService: TabService) {
        this.tabService.addTab({ name: 'Settings', url: '/settings/company' });
        this.childRoutes = CHILD_ROUTES;
    }
}