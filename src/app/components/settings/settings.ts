import {Component, OnInit} from 'angular2/core';
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, RouterLink, Router} from 'angular2/router';

import {TabService} from '../navbar/tabstrip/tabService';

import {ApplicationNav} from '../common/applicationNav/applicationNav';
import {CompanySettings} from './companySettings/companySettings';
import {AccountSettings} from './accountSettings/accountSettings';
import {UserSettings} from './userSettings/userSettings';



const CHILD_ROUTES = [
    { path: '/', redirectTo: ['CompanySettings']},
    { path: '/company', component: CompanySettings, as: 'CompanySettings' },
    { path: '/accounts', component: AccountSettings, as: 'AccountSettings' },
    { path: '/user', component: UserSettings, as: 'UserSettings' }
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
        this.childRoutes = CHILD_ROUTES.slice(1); // we dont want the redirect route in our navigation
    }
}